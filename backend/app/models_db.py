"""
RAILYATRA - Canonical Database ORM Models
Defines verified schema for Stations, Sections, Trains, Operational Events, Live States, Data Sources, and Models.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, create_engine
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class StationDB(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    zone = Column(String(20), default="NR")
    state = Column(String(50))
    corridor = Column(String(50))
    platforms = Column(Integer, default=4)
    congestion_index = Column(Float, default=0.2)

class SectionDB(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(String(50), unique=True, index=True, nullable=False)
    from_station = Column(String(10), nullable=False)
    to_station = Column(String(10), nullable=False)
    distance_km = Column(Float, nullable=False)
    max_speed_kmh = Column(Integer, default=110)
    tracks = Column(Integer, default=2)
    base_capacity = Column(Integer, default=60)
    current_congestion = Column(Float, default=0.3)
    weather = Column(String(30), default="Clear")

class TrainDB(Base):
    __tablename__ = "trains"
    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(String(20), unique=True, index=True, nullable=False)
    train_name = Column(String(100), nullable=False)
    train_type = Column(String(50), nullable=False)
    priority = Column(Integer, default=2)
    max_speed = Column(Integer, default=100)
    base_dwell_min = Column(Float, default=5.0)
    recovery_factor = Column(Float, default=0.6)
    origin = Column(String(10))
    destination = Column(String(10))
    route_json = Column(Text, nullable=False)

class OperationalEventDB(Base):
    __tablename__ = "operational_events"
    id = Column(Integer, primary_key=True, index=True)
    journey_id = Column(String(50), index=True, nullable=False)
    train_id = Column(String(20), index=True, nullable=False)
    train_name = Column(String(100))
    train_type = Column(String(50))
    priority = Column(Integer)
    journey_date = Column(String(20))
    station_code = Column(String(10), index=True)
    station_name = Column(String(100))
    sequence_idx = Column(Integer)
    is_origin = Column(Boolean, default=False)
    is_destination = Column(Boolean, default=False)
    sched_arr = Column(String(30))
    act_arr = Column(String(30))
    arr_delay_min = Column(Float, default=0.0)
    sched_dep = Column(String(30))
    act_dep = Column(String(30))
    dep_delay_min = Column(Float, default=0.0)
    dwell_sched_min = Column(Float)
    dwell_act_min = Column(Float)
    dwell_impact_min = Column(Float)
    section_id = Column(String(50))
    section_congestion = Column(Float)
    weather = Column(String(30))
    preceding_conflict_min = Column(Float, default=0.0)
    recovery_min = Column(Float, default=0.0)
    distance_from_origin_km = Column(Float, default=0.0)
    remaining_distance_km = Column(Float, default=0.0)
    data_source = Column(String(100), default="NTES Historical Observation")

class AlertDB(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(50), nullable=False)
    risk_level = Column(String(20), nullable=False)
    target_id = Column(String(50), nullable=False)
    target_name = Column(String(100))
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    probability = Column(Float, default=0.8)
    confidence = Column(Float, default=0.85)
    timestamp = Column(DateTime, default=datetime.utcnow)

class DataSourceDB(Base):
    __tablename__ = "data_sources"
    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), unique=True, index=True, nullable=False)
    source_type = Column(String(50), nullable=False)
    status = Column(String(30), nullable=False) # ONLINE, UNAVAILABLE, STALE, DEGRADED
    last_success_at = Column(DateTime, default=datetime.utcnow)
    records_ingested = Column(Integer, default=0)
    provenance_info = Column(Text)

class LiveTrainStateDB(Base):
    __tablename__ = "live_train_states"
    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(20), unique=True, index=True, nullable=False)
    journey_id = Column(String(50))
    lat = Column(Float)
    lon = Column(Float)
    speed_kmh = Column(Float, default=0.0)
    current_station = Column(String(10))
    next_station = Column(String(10))
    current_delay_min = Column(Float, default=0.0)
    status = Column(String(30), nullable=False) # VERIFIED_LIVE, ESTIMATED, STALE, UNAVAILABLE
    position_method = Column(String(50)) # TELEMETRY, GPS_FUSION, ESTIMATED_SCHEDULE
    source_name = Column(String(100))
    updated_at = Column(DateTime, default=datetime.utcnow)

class PassengerGPSObservationDB(Base):
    __tablename__ = "passenger_gps_observations"
    id = Column(Integer, primary_key=True, index=True)
    journey_session_id = Column(String(50), index=True)
    anonymous_device_id = Column(String(50))
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    accuracy_m = Column(Float)
    speed_kmh = Column(Float)
    mapped_train_number = Column(String(20))
    match_score = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class ModelVersionDB(Base):
    __tablename__ = "model_versions"
    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String(50), unique=True, index=True, nullable=False)
    algorithm = Column(String(100))
    training_period = Column(String(100))
    test_period = Column(String(100))
    mae = Column(Float)
    rmse = Column(Float)
    median_error = Column(Float)
    coverage_80 = Column(Float)
    coverage_95 = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
