"""
RAILCAST AI - Stations API Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models_db import StationDB
from app.schemas import StationSchema
from typing import List

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("/", response_model=List[StationSchema])
def get_all_stations(db: Session = Depends(get_db)):
    stations = db.query(StationDB).all()
    return [
        StationSchema(
            code=s.code,
            name=s.name,
            lat=s.lat,
            lon=s.lon,
            corridor=s.corridor,
            platforms=s.platforms,
            congestion_index=s.congestion_index
        )
        for s in stations
    ]

@router.get("/{code}", response_model=StationSchema)
def get_station_by_code(code: str, db: Session = Depends(get_db)):
    s = db.query(StationDB).filter(StationDB.code == code).first()
    if not s:
        raise HTTPException(status_code=404, detail=f"Station {code} not found")
    return StationSchema(
        code=s.code,
        name=s.name,
        lat=s.lat,
        lon=s.lon,
        corridor=s.corridor,
        platforms=s.platforms,
        congestion_index=s.congestion_index
    )
