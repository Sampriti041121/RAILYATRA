"""
RAILCAST AI - Counterfactual What-If API Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, MODEL_PIPELINE
from app.models_db import TrainDB, OperationalEventDB
from app.schemas import WhatIfRequest, WhatIfResponse
from ml.counterfactual import CounterfactualSimulator

router = APIRouter(prefix="/what-if", tags=["What-If Counterfactual Simulation"])

@router.post("/", response_model=WhatIfResponse)
def run_what_if_simulation(req: WhatIfRequest, db: Session = Depends(get_db)):
    train = db.query(TrainDB).filter(TrainDB.train_id == req.train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail=f"Train {req.train_id} not found")

    event = db.query(OperationalEventDB).filter(OperationalEventDB.train_id == req.train_id).order_by(OperationalEventDB.id.desc()).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Operational history for train {req.train_id} not found")

    feature_dict = {
        "current_delay_min": event.arr_delay_min,
        "prev_delay_min": event.dep_delay_min,
        "delay_momentum": event.arr_delay_min - event.dep_delay_min,
        "rolling_delay_3stn": event.arr_delay_min,
        "distance_completed_km": event.distance_from_origin_km,
        "distance_remaining_km": event.remaining_distance_km,
        "progress_pct": float(event.distance_from_origin_km / max(1.0, event.distance_from_origin_km + event.remaining_distance_km)),
        "dwell_impact_min": event.dwell_impact_min,
        "section_congestion": event.section_congestion,
        "weather_impact_score": 1.0,
        "preceding_conflict_min": event.preceding_conflict_min,
        "recovery_min": event.recovery_min,
        "train_priority": train.priority,
        "sequence_idx": event.sequence_idx,
        "hour_of_day": 14,
        "day_of_week": 4,
        "is_weekend": 0
    }

    sim = CounterfactualSimulator(MODEL_PIPELINE)
    res = sim.run_what_if_simulation(
        current_features=feature_dict,
        sched_arr_iso=event.sched_arr if event.sched_arr else "2026-09-05T18:00:00",
        priority_boost=req.priority_boost,
        dwell_reduction_min=req.dwell_reduction_min,
        congestion_override=req.congestion_override,
        weather_override=req.weather_override,
        clear_preceding_conflict=req.clear_preceding_conflict
    )

    return WhatIfResponse(
        train_id=train.train_id,
        is_simulation=True,
        label=res["label"],
        base_predicted_delay_min=res["base_predicted_delay_min"],
        base_eta=res["base_eta"],
        simulated_predicted_delay_min=res["simulated_predicted_delay_min"],
        simulated_eta=res["simulated_eta"],
        potential_recovery_min=res["potential_recovery_min"],
        interventions_applied=res["interventions_applied"],
        counterfactual_narrative=res["counterfactual_narrative"]
    )
