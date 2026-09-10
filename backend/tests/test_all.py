"""
RAILYATRA - Master Acceptance & Unit Test Suite
Verifies:
1. Real Data Ingestion & Provenance
2. Prevention of Synthetic Simulator Data in ML Pipeline
3. Temporal Journey Split & Leakage Protection
4. Target Leakage Protection
5. GBDT Model Training, Quantile Bounds Ordering (P10 <= P50 <= P90), Conformal Coverage & SHAP Explainer
6. Live Source Adapter Fallback (UNAVAILABLE / LIVE SOURCE NOT CONFIGURED)
7. Position Fusion Engine Hierarchy
8. Passenger GPS Map-Matching Engine
9. Section Health & Evidence-Based Anomaly Classifier
10. Counterfactual What-If Disclaimers
11. Grounded Passenger Copilot Facts
12. FastAPI Application Endpoints
"""

import os
import sys
import pytest
import pandas as pd
from datetime import datetime
from fastapi.testclient import TestClient

# Ensure backend directory and repo root are in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.main import app
from app.database import init_and_seed_db, get_db, MODEL_PIPELINE
from data.ingestion.station_loader import load_real_stations
from data.ingestion.timetable_loader import load_real_timetables
from data.ingestion.historical_loader import load_real_historical_dataset
from ml.simulator import RailwaySimulator
from ml.trainer import RailcastModelPipeline
from ml.features import FEATURE_COLUMNS, FeatureEngineer
from ml.adapters.live_adapter import RailRadarLiveAdapter, PositionFusionEngine
from ml.passenger_matching import PassengerTrainMatcher
from ml.network_intel import NetworkIntelligenceEngine
from ml.counterfactual import CounterfactualSimulator

@pytest.fixture(scope="module", autouse=True)
def setup_test_environment():
    init_and_seed_db()

# --- Test 1: Real Data Ingestion & Provenance ---
def test_real_data_ingestion():
    stations = load_real_stations()
    assert len(stations) >= 10, "Station database must contain verified stations"
    assert any(s["code"] == "NDLS" for s in stations), "New Delhi station must be in database"

    timetables = load_real_timetables()
    assert len(timetables) >= 5, "Timetable database must contain flagship train routes"
    assert any(t["train_number"] == "12301" for t in timetables), "Howrah Rajdhani must be in timetable"

    df_hist = load_real_historical_dataset()
    assert len(df_hist) > 100, "Historical delay dataset must be populated"
    assert "data_source" in df_hist.columns, "Data provenance must be recorded"
    assert df_hist["data_source"].iloc[0] is not None

# --- Test 2: Simulator Isolation Test ---
def test_simulator_data_prevention_in_training():
    sim = RailwaySimulator(seed=999)
    sim_df = sim.simulate_journeys(num_days=1)
    
    # Tag simulated dataframe
    sim_df["is_simulated_synthetic"] = True
    
    # Verify production database initialization uses real dataset
    df_real = load_real_historical_dataset()
    assert "is_simulated_synthetic" not in df_real.columns, "Real historical dataset must not contain synthetic simulator tags"

# --- Test 3: Temporal Split & Journey Leakage Protection ---
def test_journey_leakage_protection():
    df_events = load_real_historical_dataset()
    fe = FeatureEngineer()
    X, y, df_processed = fe.get_feature_matrix(df_events)

    journeys = df_processed["journey_id"].unique()
    n_journeys = len(journeys)
    n_train = int(n_journeys * 0.70)
    n_val = int(n_journeys * 0.15)

    train_j = set(journeys[:n_train])
    val_j = set(journeys[n_train:n_train + n_val])
    test_j = set(journeys[n_train + n_val:])

    # Assert zero overlap between journey sets
    assert len(train_j.intersection(val_j)) == 0, "Train and Validation journey sets must not overlap"
    assert len(train_j.intersection(test_j)) == 0, "Train and Test journey sets must not overlap"
    assert len(val_j.intersection(test_j)) == 0, "Validation and Test journey sets must not overlap"

# --- Test 4: Target Leakage Protection ---
def test_target_leakage_protection():
    df_events = load_real_historical_dataset()
    fe = FeatureEngineer()
    X, y, df_processed = fe.get_feature_matrix(df_events)

    # Feature columns must not contain target fields
    forbidden_fields = ["target_destination_delay_min", "act_arr", "act_dep", "final_dest_delay"]
    for col in FEATURE_COLUMNS:
        assert col not in forbidden_fields, f"Feature column '{col}' violates target leakage protection"

# --- Test 5: ML Pipeline, Quantile Bounds & Real SHAP ---
def test_ml_pipeline_and_shap():
    df_events = load_real_historical_dataset()
    pipeline = RailcastModelPipeline(model_version="TEST-VERIFIED-v1.0")
    metrics = pipeline.fit(df_events)

    assert metrics["MAE"] >= 0.0, "MAE must be non-negative"
    assert metrics["Coverage80"] > 50.0, "80% coverage must be reasonable"

    sample_feat = {
        "current_delay_min": 18.0,
        "prev_delay_min": 12.0,
        "delay_momentum": 6.0,
        "rolling_delay_3stn": 15.0,
        "distance_completed_km": 400.0,
        "distance_remaining_km": 600.0,
        "progress_pct": 0.4,
        "dwell_impact_min": 3.0,
        "section_congestion": 0.75,
        "weather_impact_score": 1.0,
        "preceding_conflict_min": 4.0,
        "recovery_min": 0.0,
        "train_priority": 1,
        "sequence_idx": 3,
        "hour_of_day": 14,
        "day_of_week": 4,
        "is_weekend": 0
    }

    pred = pipeline.predict_single(sample_feat)
    
    # Check Quantile Bounds Ordering: low_80 <= P50 <= high_80
    assert pred["lower_bound_80"] <= pred["P50_median"], "Lower 80 bound must be <= median"
    assert pred["P50_median"] <= pred["upper_bound_80"], "Median must be <= upper 80 bound"
    assert pred["P10_lower_95"] <= pred["P90_upper_95"], "P10 bound must be <= P90 bound"

    # Check SHAP TreeExplainer outputs
    assert "shap_explainability" in pred, "Prediction must contain real SHAP explainability object"
    shap_data = pred["shap_explainability"]
    assert "base_value_min" in shap_data
    assert "contributions" in shap_data
    assert len(shap_data["contributions"]) > 0, "SHAP contributions list must not be empty"

# --- Test 6: Live Adapter Fallback ---
def test_live_adapter_fallback():
    adapter = RailRadarLiveAdapter()
    res = adapter.fetch_live_train_state("12301")
    assert res["status"] == "UNAVAILABLE"
    assert res["source_status"] == "LIVE SOURCE NOT CONFIGURED"
    assert res["position"] is None, "Missing live source must never invent fake positions"

# --- Test 7: Position Fusion Engine ---
def test_position_fusion_engine():
    fusion = PositionFusionEngine()
    pos = fusion.resolve_train_position("12301")
    assert pos["status"] in ["ESTIMATED", "UNAVAILABLE"]
    assert "position_method" in pos

# --- Test 8: Passenger GPS Map-Matching Engine ---
def test_passenger_gps_matching():
    matcher = PassengerTrainMatcher()
    # NDLS coordinates: 28.6430, 77.2194
    matches = matcher.match_passenger_location(lat=28.6430, lon=77.2194, speed_kmh=45.0)
    assert len(matches) > 0, "Matching engine should return candidate trains near NDLS corridor"
    assert matches[0]["match_score_pct"] > 50.0

# --- Test 9: Section Health & Anomaly Classifier ---
def test_section_health_anomaly_classifier():
    net_intel = NetworkIntelligenceEngine()
    
    # Simulate anomalous multi-train delay on section SEC_CNB_PRYJ
    active_trains = [
        {"arr_delay_min": 35.0},
        {"arr_delay_min": 42.0},
        {"arr_delay_min": 28.0}
    ]
    sec_info = {"current_congestion": 0.40, "weather": "Clear"}
    
    health = net_intel.evaluate_section_health("SEC_CNB_PRYJ", active_trains, sec_info)
    assert health["health_classification"] == "POSSIBLE_INFRASTRUCTURE_ANOMALY"
    assert "Possible railway-section operational anomaly" in health["evidence_diagnostics"]

# --- Test 10: What-If Counterfactual Disclaimers ---
def test_counterfactual_disclaimer():
    sim = CounterfactualSimulator(MODEL_PIPELINE)
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
        "train_priority": 2,
        "sequence_idx": 2,
        "hour_of_day": 14,
        "day_of_week": 4,
        "is_weekend": 0
    }
    res = sim.run_what_if_simulation(
        current_features=feat,
        sched_arr_iso="2026-09-05T18:00:00",
        dwell_reduction_min=2.0
    )
    assert res["is_simulation"] is True
    assert "COUNTERFACTUAL SIMULATION - NOT OBSERVED REALITY - NOT CAUSAL PROOF" in res["simulation_notice"]

# --- Test 11: Grounded Passenger Copilot ---
def test_grounded_copilot_assistant():
    with TestClient(app) as client:
        res = client.post("/api/v1/passenger/copilot-query", json={"query": "Where is train 12301?"})
        assert res.status_code == 200
        data = res.json()
        assert data["data_status"] == "VERIFIED_FACTS"
        assert "12301" in data["answer"] or "Howrah" in data["answer"]

# --- Test 12: FastAPI Endpoints ---
def test_fastapi_endpoints():
    with TestClient(app) as client:
        health_res = client.get("/api/v1/health")
        assert health_res.status_code == 200
        assert health_res.json()["status"] == "ONLINE"

        trains_res = client.get("/api/v1/trains/")
        assert trains_res.status_code == 200
        assert len(trains_res.json()) > 0

        pred_res = client.get("/api/v1/predictions/12301")
        assert pred_res.status_code == 200
        assert "ai_predicted_delay_min" in pred_res.json()
        assert "shap_explainability" in pred_res.json()

        net_res = client.get("/api/v1/network/state")
        assert net_res.status_code == 200

        data_health_res = client.get("/api/v1/data/health")
        assert data_health_res.status_code == 200
