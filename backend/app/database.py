"""
RAILYATRA - Production Real-Data Database & ML Initialization Engine
Loads verified Indian Railways stations, timetables, and historical operational data.
Strictly excludes synthetic simulator data from ML training, validation, and live state paths.
"""

import os
import json
from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models_db import (
    Base, StationDB, SectionDB, TrainDB, OperationalEventDB, AlertDB,
    DataSourceDB, LiveTrainStateDB, ModelVersionDB
)
from data.ingestion.station_loader import load_real_stations
from data.ingestion.timetable_loader import load_real_timetables
from data.ingestion.historical_loader import load_real_historical_dataset
from ml.digital_twin import RailwayDigitalTwin
from ml.trainer import RailcastModelPipeline

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Global singleton instances
DIGITAL_TWIN = None
MODEL_PIPELINE = None

def init_and_seed_db():
    global DIGITAL_TWIN, MODEL_PIPELINE
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Check if DB is already seeded
    existing_stns = db.query(StationDB).count()
    if existing_stns > 0:
        if DIGITAL_TWIN is None:
            all_stns = db.query(StationDB).all()
            stations_dict = {s.code: {"code": s.code, "name": s.name, "lat": s.lat, "lon": s.lon, "corridor": s.corridor} for s in all_stns}
            all_secs = db.query(SectionDB).all()
            sections_list = [{
                "section_id": s.section_id,
                "from_station": s.from_station,
                "to_station": s.to_station,
                "distance_km": s.distance_km,
                "max_speed_kmh": s.max_speed_kmh,
                "tracks": s.tracks,
                "base_capacity": s.base_capacity,
                "current_congestion": s.current_congestion,
                "weather": s.weather
            } for s in all_secs]
            DIGITAL_TWIN = RailwayDigitalTwin(stations_dict, sections_list)

        if MODEL_PIPELINE is None:
            print("🤖 Initializing RAILCAST AI Model Pipeline...")
            df_events = load_real_historical_dataset()
            MODEL_PIPELINE = RailcastModelPipeline(model_version=settings.MODEL_VERSION)
            metrics = MODEL_PIPELINE.fit(df_events)
            print(f"✅ ML Model Pipeline Trained! MAE: {metrics['MAE']} min, Coverage 80%: {metrics['Coverage80']}%")
        db.close()
        return

    print("📍 Ingesting Verified Indian Railways Station Registry...")
    stations_data = load_real_stations()
    stations_dict = {}
    for stn in stations_data:
        stations_dict[stn["code"]] = stn
        if not db.query(StationDB).filter(StationDB.code == stn["code"]).first():
            db.add(StationDB(
                code=stn["code"],
                name=stn["name"],
                lat=stn["lat"],
                lon=stn["lon"],
                zone=stn.get("zone", "NR"),
                state=stn.get("state", ""),
                corridor=stn.get("corridor", ""),
                platforms=stn.get("platforms", 4),
                congestion_index=stn.get("congestion_index", 0.2)
            ))

    print("🚆 Ingesting Official Indian Railways Train Timetables...")
    timetables_data = load_real_timetables()
    sections_list = []
    seen_sections = set()

    for tr in timetables_data:
        tr_num = tr["train_number"]
        if not db.query(TrainDB).filter(TrainDB.train_id == tr_num).first():
            db.add(TrainDB(
                train_id=tr_num,
                train_name=tr["train_name"],
                train_type=tr["train_type"],
                priority=tr["priority"],
                max_speed=tr["max_speed"],
                base_dwell_min=tr["base_dwell_min"],
                recovery_factor=tr["recovery_factor"],
                origin=tr["origin"],
                destination=tr["destination"],
                route_json=json.dumps(tr["route"])
            ))

        # Build section topologies from train routes
        route = tr["route"]
        for i in range(len(route) - 1):
            stn1 = route[i]["station_code"]
            stn2 = route[i+1]["station_code"]
            sec_id = f"SEC_{stn1}_{stn2}"
            if sec_id not in seen_sections:
                seen_sections.add(sec_id)
                dist = max(1.0, float(route[i+1]["distance_km"] - route[i]["distance_km"]))
                sections_list.append({
                    "section_id": sec_id,
                    "from_station": stn1,
                    "to_station": stn2,
                    "distance_km": dist,
                    "max_speed_kmh": 110,
                    "tracks": 2,
                    "base_capacity": 60,
                    "current_congestion": 0.35,
                    "weather": "Clear"
                })

    for sec in sections_list:
        if not db.query(SectionDB).filter(SectionDB.section_id == sec["section_id"]).first():
            db.add(SectionDB(
                section_id=sec["section_id"],
                from_station=sec["from_station"],
                to_station=sec["to_station"],
                distance_km=sec["distance_km"],
                max_speed_kmh=sec["max_speed_kmh"],
                tracks=sec["tracks"],
                base_capacity=sec["base_capacity"],
                current_congestion=sec["current_congestion"],
                weather=sec["weather"]
            ))

    db.commit()

    # Build Network Digital Twin Graph
    print("🌐 Building Railway Network Digital Twin Graph...")
    DIGITAL_TWIN = RailwayDigitalTwin(stations_dict, sections_list)

    # Ingest Real Historical Operational Dataset for ML Training
    print("💾 Ingesting Real Historical Delay Dataset...")
    df_events = load_real_historical_dataset()

    if db.query(OperationalEventDB).count() == 0:
        db_events = []
        for _, row in df_events.iterrows():
            db_events.append(OperationalEventDB(
                journey_id=str(row["journey_id"]),
                train_id=str(row["train_number"]),
                train_name=str(row["train_name"]),
                train_type=str(row["train_type"]),
                priority=int(row["priority"]),
                journey_date=str(row["journey_date"]),
                station_code=str(row["station_code"]),
                station_name=str(row["station_name"]),
                sequence_idx=int(row["sequence_idx"]),
                is_origin=bool(row["is_origin"]),
                is_destination=bool(row["is_destination"]),
                sched_arr=str(row["sched_arr"]),
                act_arr=str(row["act_arr"]),
                arr_delay_min=float(row["arr_delay_min"]),
                sched_dep=str(row["sched_dep"]),
                act_dep=str(row["act_dep"]),
                dep_delay_min=float(row["dep_delay_min"]),
                dwell_sched_min=float(row.get("dwell_sched_min", 0.0)),
                dwell_act_min=float(row.get("dwell_act_min", 0.0)),
                dwell_impact_min=float(row.get("dwell_impact_min", 0.0)),
                section_id=str(row["section_id"]),
                section_congestion=float(row.get("section_congestion", 0.3)),
                weather=str(row.get("weather", "Clear")),
                preceding_conflict_min=float(row.get("preceding_conflict_min", 0.0)),
                recovery_min=float(row.get("recovery_min", 0.0)),
                distance_from_origin_km=float(row.get("distance_from_origin_km", 0.0)),
                remaining_distance_km=float(row.get("remaining_distance_km", 0.0)),
                data_source=str(row.get("data_source", "NTES Historical Observation"))
            ))
        db.bulk_save_objects(db_events)

    # Ingest Data Provenance Metadata
    if db.query(DataSourceDB).count() == 0:
        db.add(DataSourceDB(
            source_name="Indian Railways NTES Timetable Registry",
            source_type="SCHEDULE_TIMETABLE",
            status="ONLINE",
            records_ingested=len(timetables_data),
            provenance_info="Official Government Timetable Catalog (data.gov.in)"
        ))
        db.add(DataSourceDB(
            source_name="Historical Operational Delay Dataset",
            source_type="HISTORICAL_OBSERVATIONS",
            status="ONLINE",
            records_ingested=len(df_events),
            provenance_info="NTES Historical Running Records & Delay Logs"
        ))
        db.add(DataSourceDB(
            source_name="Live Railway Telemetry Adapter",
            source_type="LIVE_TELEMETRY",
            status="UNAVAILABLE",
            records_ingested=0,
            provenance_info="Live External Adapter (Requires valid NTES/RailRadar credentials)"
        ))

    db.commit()
    db.close()

    # Train RAILCAST GBDT & Conformal Uncertainty ML Pipeline
    print("🤖 Training RAILCAST AI Model Pipeline on Real Historical Dataset...")
    MODEL_PIPELINE = RailcastModelPipeline(model_version=settings.MODEL_VERSION)
    metrics = MODEL_PIPELINE.fit(df_events)
    print(f"✅ ML Model Pipeline Trained! MAE: {metrics['MAE']} min, Coverage 80%: {metrics['Coverage80']}%, Latency: {metrics['InferenceLatencyMs']} ms")
