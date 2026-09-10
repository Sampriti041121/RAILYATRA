"""
RAILYATRA - Counterfactual Operations Simulator & Delay Recovery Engine
Simulates "What-If" scenarios by recalculating ETA predictions under hypothetical operational interventions.
Explicitly labels all outputs as COUNTERFACTUAL SIMULATION - NOT OBSERVED REALITY - NOT CAUSAL PROOF.
"""

from datetime import datetime, timedelta

class CounterfactualSimulator:
    def __init__(self, model_pipeline):
        self.model_pipeline = model_pipeline

    def run_what_if_simulation(
        self,
        current_features: dict,
        sched_arr_iso: str,
        priority_boost: int = 0,
        dwell_reduction_min: float = 0.0,
        congestion_override: float = None,
        weather_override: str = None,
        clear_preceding_conflict: bool = False
    ):
        # Base Prediction
        base_result = self.model_pipeline.predict_single(current_features)
        base_delay = base_result["predicted_delay_min"]

        # Build Counterfactual Feature Vector
        cf_features = current_features.copy()

        if priority_boost != 0:
            cf_features["train_priority"] = max(1, cf_features.get("train_priority", 2) - priority_boost)

        if dwell_reduction_min > 0:
            cf_features["dwell_impact_min"] = max(0.0, cf_features.get("dwell_impact_min", 0.0) - dwell_reduction_min)

        if congestion_override is not None:
            cf_features["section_congestion"] = max(0.05, min(1.0, congestion_override))

        if weather_override:
            w_map = {"Clear": 1.0, "Light Rain": 1.1, "Heavy Rain": 1.3, "Dense Fog": 1.5, "Severe Storm": 1.8}
            cf_features["weather_impact_score"] = w_map.get(weather_override, 1.0)

        if clear_preceding_conflict:
            cf_features["preceding_conflict_min"] = 0.0

        # Run Counterfactual Model Prediction
        cf_result = self.model_pipeline.predict_single(cf_features)
        cf_delay = cf_result["predicted_delay_min"]

        potential_recovery = round(max(0.0, base_delay - cf_delay), 1)

        # Parse schedule date
        try:
            sched_arr_dt = datetime.fromisoformat(sched_arr_iso)
        except Exception:
            sched_arr_dt = datetime.now()

        base_eta_dt = sched_arr_dt + timedelta(minutes=base_delay)
        cf_eta_dt = sched_arr_dt + timedelta(minutes=cf_delay)

        narrative = (
            f"Baseline prediction estimates arrival delay of {base_delay:.1f} min (ETA {base_eta_dt.strftime('%H:%M')}). "
            f"Under simulated counterfactual operational interventions "
            f"(Dwell reduction: -{dwell_reduction_min} min, Congestion adjustment: {cf_features['section_congestion']:.2f}), "
            f"the simulated ETA improves to {cf_eta_dt.strftime('%H:%M')} (Delay: {cf_delay:.1f} min). "
            f"Achievable recovery opportunity: {potential_recovery:.1f} minutes."
        )

        return {
            "is_simulation": True,
            "simulation_notice": "COUNTERFACTUAL SIMULATION - NOT OBSERVED REALITY - NOT CAUSAL PROOF",
            "label": "SIMULATED / COUNTERFACTUAL PREDICTION",
            "base_predicted_delay_min": base_delay,
            "base_eta": base_eta_dt.strftime("%H:%M"),
            "simulated_predicted_delay_min": cf_delay,
            "simulated_eta": cf_eta_dt.strftime("%H:%M"),
            "potential_recovery_min": potential_recovery,
            "interventions_applied": {
                "priority_boost": priority_boost,
                "dwell_reduction_min": dwell_reduction_min,
                "congestion_override": congestion_override,
                "weather_override": weather_override,
                "clear_preceding_conflict": clear_preceding_conflict
            },
            "counterfactual_narrative": narrative
        }
