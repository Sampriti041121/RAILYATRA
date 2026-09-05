"""
RAILCAST AI - Comprehensive Test Suite
Tests Simulator, Data Quality, ML Pipeline, Counterfactual What-If, and FastAPI Endpoints.
"""

import sys
import os
import pytest
import pandas as pd
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database import init_and_seed_db, MODEL_PIPELINE
from ml.simulator import RailwaySimulator
from ml.data_quality import DataQualityEngine
from ml.features import FeatureEngineer
from ml.trainer import RailcastModelPipeline
from ml.counterfactual import CounterfactualSimulator

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_and_seed_db()

def test_simulator_generation():
    sim = RailwaySimulator(seed=123)
    assert len(sim.stations) >= 100
    assert len(sim.sections) >= 20
    assert len(sim.train_routes) >= 50
    df = sim.simulate_journeys(num_days=1)
    assert len(df) > 100
    assert "arr_delay_min" in df.columns

def test_data_quality_engine():
    dq = DataQualityEngine()
    df_sample = pd.DataFrame([{
        "journey_id": "J1",
        "train_id": "12001",
        "station_code": "NDLS",
        "sequence_idx": 0,
        "sched_arr": "2026-09-05T10:00:00",
        "act_arr": "2026-09-05T10:05:00",
        "sched_dep": "2026-09-05T10:10:00",
        "act_dep": "2026-09-05T10:15:00",
        "arr_delay_min": 5.0,
        "distance_from_origin_km": 0.0
    }])
    report = dq.evaluate(df_sample)
    assert report["quality_score"] > 80.0
    assert report["status"] == "HEALTHY"

def test_ml_pipeline():
    sim = RailwaySimulator(seed=42)
    df = sim.simulate_journeys(num_days=2)
    pipeline = RailcastModelPipeline("TEST-v1.0")
    metrics = pipeline.fit(df)
    assert metrics["MAE"] >= 0.0
    assert metrics["Coverage80"] >= 60.0
    
    sample_feat = {
        "current_delay_min": 10.0,
        "prev_delay_min": 8.0,
        "delay_momentum": 2.0,
        "rolling_delay_3stn": 9.0,
        "distance_completed_km": 400.0,
        "distance_remaining_km": 600.0,
        "progress_pct": 0.4,
        "dwell_impact_min": 2.0,
        "section_congestion": 0.6,
        "weather_impact_score": 1.0,
        "preceding_conflict_min": 3.0,
        "recovery_min": 0.0,
        "train_priority": 2,
        "sequence_idx": 3,
        "hour_of_day": 14,
        "day_of_week": 4,
        "is_weekend": 0
    }
    pred = pipeline.predict_single(sample_feat)
    assert pred["predicted_delay_min"] >= 0.0
    assert pred["lower_bound_80"] <= pred["predicted_delay_min"]
    assert pred["upper_bound_80"] >= pred["predicted_delay_min"]

def test_counterfactual_simulation():
    from app.database import MODEL_PIPELINE
    cf_sim = CounterfactualSimulator(MODEL_PIPELINE)
    feat = {
        "current_delay_min": 15.0,
        "prev_delay_min": 10.0,
        "delay_momentum": 5.0,
        "rolling_delay_3stn": 12.0,
        "distance_completed_km": 300.0,
        "distance_remaining_km": 500.0,
        "progress_pct": 0.375,
        "dwell_impact_min": 4.0,
        "section_congestion": 0.8,
        "weather_impact_score": 1.0,
        "preceding_conflict_min": 5.0,
        "recovery_min": 0.0,
        "train_priority": 3,
        "sequence_idx": 2,
        "hour_of_day": 14,
        "day_of_week": 4,
        "is_weekend": 0
    }
    res = cf_sim.run_what_if_simulation(
        current_features=feat,
        sched_arr_iso="2026-09-05T18:00:00",
        priority_boost=1,
        dwell_reduction_min=2.0,
        congestion_override=0.3
    )
    assert res["is_simulation"] is True
    assert res["potential_recovery_min"] >= 0.0

def test_fastapi_endpoints():
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ONLINE"

        trains_res = client.get("/api/v1/trains/")
        assert trains_res.status_code == 200
        assert len(trains_res.json()) > 0

        net_res = client.get("/api/v1/network/state")
        assert net_res.status_code == 200
        assert "network_pressure_index" in net_res.json()

        alerts_res = client.get("/api/v1/alerts/")
        assert alerts_res.status_code == 200
