"""
RAILCAST AI - Trains API Router
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models_db import TrainDB, OperationalEventDB
from app.schemas import TrainSchema
from typing import List

router = APIRouter(prefix="/trains", tags=["Trains"])

@router.get("/", response_model=List[TrainSchema])
def get_all_trains(db: Session = Depends(get_db)):
    trains_db = db.query(TrainDB).all()
    results = []
    for t in trains_db:
        results.append(TrainSchema(
            train_id=t.train_id,
            train_name=t.train_name,
            train_type=t.train_type,
            priority=t.priority,
            max_speed=t.max_speed,
            base_dwell_min=t.base_dwell_min,
            recovery_factor=t.recovery_factor,
            route=json.loads(t.route_json)
        ))
    return results

@router.get("/{train_id}")
def get_train_by_id(train_id: str, db: Session = Depends(get_db)):
    t = db.query(TrainDB).filter(TrainDB.train_id == train_id).first()
    if not t:
        raise HTTPException(status_code=404, detail=f"Train {train_id} not found")
    
    latest_event = db.query(OperationalEventDB).filter(OperationalEventDB.train_id == train_id).order_by(OperationalEventDB.id.desc()).first()

    return {
        "train_id": t.train_id,
        "train_name": t.train_name,
        "train_type": t.train_type,
        "priority": t.priority,
        "max_speed": t.max_speed,
        "base_dwell_min": t.base_dwell_min,
        "route": json.loads(t.route_json),
        "latest_event": {
            "journey_id": latest_event.journey_id if latest_event else None,
            "current_station": latest_event.station_name if latest_event else "NDLS",
            "arr_delay_min": latest_event.arr_delay_min if latest_event else 0.0,
            "section_congestion": latest_event.section_congestion if latest_event else 0.3,
            "weather": latest_event.weather if latest_event else "Clear"
        }
    }
