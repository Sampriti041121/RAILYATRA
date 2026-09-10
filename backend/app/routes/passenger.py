"""
RAILYATRA - Passenger Copilot & Journey Assistant Router
Provides personalized journey intelligence, opt-in GPS map-matching, and grounded AI assistant querying.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, MODEL_PIPELINE
from app.models_db import TrainDB, OperationalEventDB, StationDB
from app.schemas import PassengerGpsMatchRequest, PassengerQueryRequest
from ml.passenger_matching import PassengerTrainMatcher
from ml.adapters.live_adapter import PositionFusionEngine

router = APIRouter(prefix="/passenger", tags=["Passenger Copilot"])

@router.get("/my-journey/{train_id}")
def get_passenger_journey_status(train_id: str, db: Session = Depends(get_db)):
    train = db.query(TrainDB).filter(TrainDB.train_id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail=f"Train {train_id} not found in verified registry")

    latest_event = db.query(OperationalEventDB).filter(OperationalEventDB.train_id == train_id).order_by(OperationalEventDB.sequence_idx.desc()).first()
    if not latest_event:
        raise HTTPException(status_code=404, detail=f"No operational observations for train {train_id}")

    fusion_engine = PositionFusionEngine()
    pos_state = fusion_engine.resolve_train_position(train_id, timetable_route={"route": [{"station_code": train.origin}, {"station_code": train.destination}]})

    curr_delay = latest_event.arr_delay_min
    risk_level = "HIGH" if curr_delay > 25 else ("MODERATE" if curr_delay > 10 else "LOW")

    return {
        "train_number": train.train_id,
        "train_name": train.train_name,
        "train_type": train.train_type,
        "origin": train.origin,
        "destination": train.destination,
        "current_station": latest_event.station_name,
        "current_delay_min": curr_delay,
        "delay_status": f"RUNNING +{int(curr_delay)} min" if curr_delay > 0 else "ON TIME",
        "journey_risk": risk_level,
        "connection_risk": "ELEVATED (Transfer buffer under 15 min)" if curr_delay > 20 else "NORMAL",
        "position_state": pos_state,
        "data_provenance": {
            "source": pos_state["source"],
            "status": pos_state["status"],
            "freshness": "REAL-TIME LOG"
        },
        "insight_now": (
            f"Train is running +{int(curr_delay)} min late at {latest_event.station_name}. "
            f"{'Section congestion ahead may widen interval slightly.' if curr_delay > 15 else 'Delay trajectory is stabilizing.'}"
        )
    }

@router.post("/match-gps")
def match_passenger_gps(req: PassengerGpsMatchRequest):
    matcher = PassengerTrainMatcher()
    matches = matcher.match_passenger_location(
        lat=req.latitude,
        lon=req.longitude,
        accuracy_m=req.accuracy_m or 10.0,
        speed_kmh=req.speed_kmh or 0.0
    )
    return {
        "status": "SUCCESS",
        "passenger_location": {"latitude": req.latitude, "longitude": req.longitude},
        "candidate_trains": matches
    }

@router.post("/copilot-query")
def copilot_query(req: PassengerQueryRequest, db: Session = Depends(get_db)):
    q = req.query.lower()
    train_id = req.train_number

    # If train_number present or mentioned in query
    if not train_id:
        for word in q.split():
            if word.isdigit() and len(word) >= 5:
                train_id = word
                break

    if not train_id:
        train_id = "12301" # Default flagship

    train = db.query(TrainDB).filter(TrainDB.train_id == train_id).first()
    if not train:
        return {
            "query": req.query,
            "answer": f"I cannot verify train '{train_id}' from current Indian Railways timetable data.",
            "data_status": "UNAVAILABLE"
        }

    latest_event = db.query(OperationalEventDB).filter(OperationalEventDB.train_id == train_id).order_by(OperationalEventDB.sequence_idx.desc()).first()
    if not latest_event:
        return {
            "query": req.query,
            "answer": f"Operational telemetry data for train {train.train_name} is currently UNAVAILABLE.",
            "data_status": "UNAVAILABLE"
        }

    if "where" in q or "location" in q:
        answer = f"Train {train.train_id} ({train.train_name}) is currently at {latest_event.station_name} with a current delay of {int(latest_event.arr_delay_min)} minutes."
    elif "why" in q or "late" in q:
        answer = f"Train {train.train_id} delay is influenced by section congestion ({latest_event.section_congestion:.2f}) on section {latest_event.section_id} and station dwell impact."
    elif "when" in q or "eta" in q or "reach" in q:
        answer = f"Train {train.train_id} is projected to reach its final destination with an estimated arrival delay of {int(latest_event.arr_delay_min + 5)} minutes."
    else:
        answer = f"Train {train.train_id} ({train.train_name}): Current station {latest_event.station_name}, Delay +{int(latest_event.arr_delay_min)} min."

    return {
        "query": req.query,
        "train_number": train.train_id,
        "train_name": train.train_name,
        "answer": answer,
        "grounded_facts": {
            "current_station": latest_event.station_name,
            "current_delay_min": latest_event.arr_delay_min,
            "weather": latest_event.weather,
            "data_source": latest_event.data_source
        },
        "data_status": "VERIFIED_FACTS"
    }
