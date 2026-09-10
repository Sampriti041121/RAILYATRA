"""
RAILCAST AI - Network Intelligence API Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, DIGITAL_TWIN
from app.models_db import OperationalEventDB, SectionDB
from ml.network_intel import NetworkIntelligenceEngine

router = APIRouter(prefix="/network", tags=["Network"])

@router.get("/state")
@router.get("/health")
def get_network_health(db: Session = Depends(get_db)):
    events = db.query(OperationalEventDB).order_by(OperationalEventDB.id.desc()).limit(120).all()
    events_data = [{
        "arr_delay_min": e.arr_delay_min,
        "act_arr": e.act_arr,
        "section_id": e.section_id,
        "priority": e.priority
    } for e in events]
    
    if DIGITAL_TWIN:
        return DIGITAL_TWIN.get_network_state(events_data)
    
    return {
        "active_trains": 85,
        "delayed_trains": 24,
        "critical_sections": 5,
        "average_delay_min": 14.2,
        "network_pressure_index": 62.5,
        "pressure_status": "HIGH"
    }

@router.get("/bottlenecks")
def get_network_bottlenecks(db: Session = Depends(get_db)):
    events = db.query(OperationalEventDB).order_by(OperationalEventDB.id.desc()).limit(150).all()
    events_data = [{
        "arr_delay_min": e.arr_delay_min,
        "section_id": e.section_id,
        "priority": e.priority
    } for e in events]
    
    if DIGITAL_TWIN:
        return DIGITAL_TWIN.get_bottleneck_sections(events_data, top_k=6)
    
    return []

@router.get("/graph")
def get_network_graph():
    if DIGITAL_TWIN:
        return DIGITAL_TWIN.get_graph_export()
    return {"nodes": [], "edges": []}

@router.get("/sections")
def get_all_sections(db: Session = Depends(get_db)):
    sections = db.query(SectionDB).all()
    return [{
        "section_id": sec.section_id,
        "from_station": sec.from_station,
        "to_station": sec.to_station,
        "distance_km": sec.distance_km,
        "max_speed_kmh": sec.max_speed_kmh,
        "current_congestion": sec.current_congestion,
        "weather": sec.weather
    } for sec in sections]

@router.get("/sections/{section_id}/health")
def get_section_health(section_id: str, db: Session = Depends(get_db)):
    sec = db.query(SectionDB).filter(SectionDB.section_id == section_id).first()
    if not sec:
        sec_info = {"current_congestion": 0.35, "weather": "Clear"}
    else:
        sec_info = {"current_congestion": sec.current_congestion, "weather": sec.weather}

    events = db.query(OperationalEventDB).filter(OperationalEventDB.section_id == section_id).order_by(OperationalEventDB.id.desc()).limit(10).all()
    active_trains = [{"arr_delay_min": e.arr_delay_min, "train_id": e.train_id} for e in events]

    net_intel = NetworkIntelligenceEngine()
    health = net_intel.evaluate_section_health(section_id, active_trains, sec_info)
    return health

@router.get("/cascade/{train_id}")
def get_train_cascade(train_id: str, db: Session = Depends(get_db)):
    target_event = db.query(OperationalEventDB).filter(OperationalEventDB.train_id == train_id).order_by(OperationalEventDB.id.desc()).first()
    if not target_event:
        return {
            "source_train_id": train_id,
            "source_delay_min": 0.0,
            "affected_trains_count": 0,
            "total_propagated_train_minutes": 0.0,
            "cascade_details": []
        }

    all_events = db.query(OperationalEventDB).order_by(OperationalEventDB.id.desc()).limit(50).all()
    all_active = [{"train_id": e.train_id, "train_name": e.train_name, "priority": e.priority, "arr_delay_min": e.arr_delay_min} for e in all_events]

    target_dict = {
        "train_id": target_event.train_id,
        "arr_delay_min": target_event.arr_delay_min,
        "section_id": target_event.section_id,
        "priority": target_event.priority
    }

    net_intel = NetworkIntelligenceEngine()
    cascade = net_intel.predict_network_cascade(target_dict, all_active)
    return cascade

