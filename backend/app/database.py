"""
RAILCAST AI - Database Initialization & Seeding Engine
"""

import os
import json
from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models_db import Base, StationDB, SectionDB, TrainDB, OperationalEventDB, AlertDB
from ml.simulator import RailwaySimulator
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

# Global instances
SIMULATOR = None
DIGITAL_TWIN = None
MODEL_PIPELINE = None

def init_and_seed_db():
    global SIMULATOR, DIGITAL_TWIN, MODEL_PIPELINE
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    # Check if already seeded
    existing_stns = db.query(StationDB).count()
    if existing_stns > 0 and MODEL_PIPELINE is not None:
        db.close()
        return

    print("⚡ Initializing Railway Operations Simulator...")
    SIMULATOR = RailwaySimulator(seed=42)

    # Seed Stations
    print(f"📍 Seeding {len(SIMULATOR.stations)} stations...")
    for stn in SIMULATOR.stations.values():
        if not db.query(StationDB).filter(StationDB.code == stn["code"]).first():
            db.add(StationDB(
                code=stn["code"],
                name=stn["name"],
                lat=stn["lat"],
                lon=stn["lon"],
                corridor=stn["corridor"],
                platforms=stn["platforms"],
                congestion_index=stn["congestion_index"]
            ))

    # Seed Sections
    print(f"🛤️ Seeding {len(SIMULATOR.sections)} railway sections...")
    for sec in SIMULATOR.sections:
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

    # Seed Trains
    print(f"🚆 Seeding {len(SIMULATOR.train_routes)} train routes...")
    for tr in SIMULATOR.train_routes:
        if not db.query(TrainDB).filter(TrainDB.train_id == tr["train_id"]).first():
            db.add(TrainDB(
                train_id=tr["train_id"],
                train_name=tr["train_name"],
                train_type=tr["train_type"],
                priority=tr["priority"],
                max_speed=tr["max_speed"],
                base_dwell_min=tr["base_dwell_min"],
                recovery_factor=tr["recovery_factor"],
                route_json=json.dumps(tr["route"])
            ))

    db.commit()

    # Instantiate Digital Twin
    print("🌐 Building Railway Digital Twin Graph...")
    DIGITAL_TWIN = RailwayDigitalTwin(SIMULATOR.stations, SIMULATOR.sections)

    # Simulate Journey Events for ML Training
    print("🔄 Running Causal Operational Simulation (Generating ~10,000+ training events)...")
    df_events = SIMULATOR.simulate_journeys(num_days=7)

    # Seed DB Events
    print(f"💾 Saving {len(df_events)} operational events to SQLite Database...")
    db_events = []
    for _, row in df_events.iterrows():
        db_events.append(OperationalEventDB(
            journey_id=row["journey_id"],
            train_id=row["train_id"],
            train_name=row["train_name"],
            train_type=row["train_type"],
            priority=row["priority"],
            station_code=row["station_code"],
            station_name=row["station_name"],
            sequence_idx=int(row["sequence_idx"]),
            is_origin=bool(row["is_origin"]),
            is_destination=bool(row["is_destination"]),
            sched_arr=str(row["sched_arr"]),
            act_arr=str(row["act_arr"]),
            arr_delay_min=float(row["arr_delay_min"]),
            sched_dep=str(row["sched_dep"]),
            act_dep=str(row["act_dep"]),
            dep_delay_min=float(row["dep_delay_min"]),
            dwell_sched_min=float(row["dwell_sched_min"]),
            dwell_act_min=float(row["dwell_act_min"]),
            dwell_impact_min=float(row["dwell_impact_min"]),
            section_id=row["section_id"],
            section_congestion=float(row["section_congestion"]),
            weather=row["weather"],
            preceding_conflict_min=float(row["preceding_conflict_min"]),
            recovery_min=float(row["recovery_min"]),
            distance_from_origin_km=float(row["distance_from_origin_km"]),
            remaining_distance_km=float(row["remaining_distance_km"])
        ))

    db.bulk_save_objects(db_events)

    # Seed Initial Operational Alerts
    print("🚨 Generating Initial Operational Risk Alerts...")
    db.add(AlertDB(
        alert_type="HIGH_ETA_RISK",
        risk_level="HIGH",
        target_id="12005",
        target_name="NDLS-CNB Rajdhani / Shatabdi",
        title="High ETA Delay Amplification Expected",
        message="Train 12005 currently delayed by 18 min. High congestion on section SEC_CNB_PRYJ predicted to amplify destination delay to +32 min.",
        probability=0.88,
        confidence=0.91
    ))
    db.add(AlertDB(
        alert_type="NETWORK_CASCADE_RISK",
        risk_level="CRITICAL",
        target_id="SEC_CNB_PRYJ",
        target_name="Kanpur - Prayagraj Trunk Section",
        title="Network Delay Cascade Detected",
        message="Section SEC_CNB_PRYJ congestion index reached 0.82. Estimated 4 active trains experiencing signal aspect delay cascade (44 total train-minutes).",
        probability=0.94,
        confidence=0.95
    ))

    db.commit()
    db.close()

    # Train ML Model Pipeline
    print("🤖 Training GBDT & Quantile Uncertainty Model Pipeline...")
    MODEL_PIPELINE = RailcastModelPipeline(model_version=settings.MODEL_VERSION)
    metrics = MODEL_PIPELINE.fit(df_events)
    print(f"✅ ML Model Pipeline Trained successfully! MAE: {metrics['MAE']} min, Coverage 80%: {metrics['Coverage80']}%, Latency: {metrics['InferenceLatencyMs']} ms")
