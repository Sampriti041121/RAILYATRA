"""
RAILYATRA - Pydantic Request & Response Schemas
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class StationSchema(BaseModel):
    code: str
    name: str
    lat: float
    lon: float
    corridor: Optional[str] = None
    platforms: int
    congestion_index: float

class SectionSchema(BaseModel):
    section_id: str
    from_station: str
    to_station: str
    distance_km: float
    max_speed_kmh: int
    tracks: int
    base_capacity: int
    current_congestion: float
    weather: str

class TrainSchema(BaseModel):
    train_id: str
    train_name: str
    train_type: str
    priority: int
    max_speed: int
    base_dwell_min: float
    recovery_factor: float
    route: List[str]

class PredictionTrajectoryItem(BaseModel):
    sequence_idx: int
    station_code: str
    station_name: str
    sched_arr: str
    sched_dep: str
    actual_or_forecast_arr: str
    forecast_arr_delay_min: float
    status: str

class ShapContributionItem(BaseModel):
    feature: str
    feature_value: float
    impact_min: float
    direction: str

class ShapExplainabilitySchema(BaseModel):
    base_value_min: float
    predicted_value_min: float
    contributions: List[ShapContributionItem]

class NovelMetricsSchema(BaseModel):
    delay_momentum: float
    delay_momentum_status: str
    eta_trust_score: float
    model_disagreement_min: float
    model_disagreement_level: str
    operational_risk_radar: Dict[str, float]

class TrainPredictionResponse(BaseModel):
    train_id: str
    train_name: str
    current_station: str
    current_delay_min: float
    sched_destination_eta: str
    ai_predicted_destination_eta: str
    ai_predicted_delay_min: float
    P10_lower_95_eta: Optional[str] = None
    P50_median_eta: Optional[str] = None
    P90_upper_95_eta: Optional[str] = None
    lower_bound_80_eta: str
    upper_bound_80_eta: str
    lower_bound_95_eta: str
    upper_bound_95_eta: str
    interval_width_min: float
    amplification_factor: float
    model_version: str
    trajectory: List[PredictionTrajectoryItem]
    shap_explainability: Optional[ShapExplainabilitySchema] = None
    delay_dna: Dict[str, Any]
    cascade_prediction: Dict[str, Any]
    novel_metrics: NovelMetricsSchema
    ai_story_narrative: str
    data_status: str = "HISTORICAL" # LIVE, PREDICTED, HISTORICAL, ESTIMATED, STALE, UNAVAILABLE

class WhatIfRequest(BaseModel):
    train_id: str
    priority_boost: int = 0
    dwell_reduction_min: float = 0.0
    congestion_override: Optional[float] = None
    weather_override: Optional[str] = None
    clear_preceding_conflict: bool = False

class WhatIfResponse(BaseModel):
    train_id: str
    is_simulation: bool = True
    simulation_notice: str = "COUNTERFACTUAL SIMULATION - NOT OBSERVED REALITY - NOT CAUSAL PROOF"
    label: str
    base_predicted_delay_min: float
    base_eta: str
    simulated_predicted_delay_min: float
    simulated_eta: str
    potential_recovery_min: float
    interventions_applied: Dict[str, Any]
    counterfactual_narrative: str

class AlertSchema(BaseModel):
    id: int
    alert_type: str
    risk_level: str
    target_id: str
    target_name: Optional[str] = None
    title: str
    message: str
    probability: float
    confidence: float
    timestamp: str

class DataHealthSchema(BaseModel):
    quality_score: float
    status: str
    total_rows_ingested: int
    metrics: Dict[str, float]
    anomalies_detected: Dict[str, int]
    last_evaluated: str

class PassengerGpsMatchRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy_m: Optional[float] = 10.0
    speed_kmh: Optional[float] = 0.0

class PassengerQueryRequest(BaseModel):
    query: str
    train_number: Optional[str] = None
