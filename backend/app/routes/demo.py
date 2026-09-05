"""
RAILCAST AI - Deterministic Judge Demo Mode Router
"""

from fastapi import APIRouter

router = APIRouter(prefix="/demo", tags=["Demo Mode"])

@router.get("/scenario")
def get_demo_scenario():
    """
    Returns step-by-step deterministic demo scenario for judge evaluation (< 60s pitch).
    """
    return {
        "scenario_title": "SIH26028 Live Operational Disruption & Counterfactual Recovery",
        "description": "Simulates Train 12001 initial delay propagation, AI trajectory widening, network cascade to following trains, and operator counterfactual recovery.",
        "steps": [
            {
                "step": 1,
                "timestamp": "14:00:00",
                "event": "Train 12001 (NDLS-CNB Vande Bharat) departs initial origin with minor 7-minute weather delay.",
                "network_pressure_index": 38.0,
                "pressure_status": "LOW",
                "train_status": {"arr_delay_min": 7.0, "delay_momentum": 0.0, "ai_predicted_dest_delay": 9.5}
            },
            {
                "step": 2,
                "timestamp": "14:15:00",
                "event": "Section SEC_CNB_PRYJ congestion rises to 0.82 due to freight crossing conflict.",
                "network_pressure_index": 56.5,
                "pressure_status": "HIGH",
                "train_status": {"arr_delay_min": 14.0, "delay_momentum": 0.42, "ai_predicted_dest_delay": 28.0}
            },
            {
                "step": 3,
                "timestamp": "14:30:00",
                "event": "Network Intelligence Engine detects delay cascade propagating to Train 12002 (+9m) and Train 12003 (+5m). Total cascade: 41 train-minutes.",
                "network_pressure_index": 74.2,
                "pressure_status": "CRITICAL",
                "alert": "CRITICAL: Downstream Delay Cascade across 4 sections",
                "train_status": {"arr_delay_min": 18.0, "delay_momentum": 0.38, "ai_predicted_dest_delay": 35.0}
            },
            {
                "step": 4,
                "timestamp": "14:32:00",
                "event": "Operator activates Counterfactual What-If: Reduces dwell at Station CNB by 3 min & grants Section Priority (congestion 0.82 -> 0.25).",
                "what_if_simulation": {
                    "before_eta": "19:08",
                    "counterfactual_eta": "18:57",
                    "potential_recovery_min": 11.0,
                    "simulated_predicted_delay": 24.0
                }
            }
        ]
    }
