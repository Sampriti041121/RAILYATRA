"""
RAILCAST AI - Alerts API Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models_db import AlertDB
from app.schemas import AlertSchema
from typing import List

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/", response_model=List[AlertSchema])
def get_active_alerts(db: Session = Depends(get_db)):
    alerts = db.query(AlertDB).order_by(AlertDB.id.desc()).all()
    results = []
    for a in alerts:
        results.append(AlertSchema(
            id=a.id,
            alert_type=a.alert_type,
            risk_level=a.risk_level,
            target_id=a.target_id,
            target_name=a.target_name,
            title=a.title,
            message=a.message,
            probability=a.probability,
            confidence=a.confidence,
            timestamp=a.timestamp.isoformat() if a.timestamp else "2026-09-05T10:30:00"
        ))
    return results
