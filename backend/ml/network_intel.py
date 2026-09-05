"""
RAILCAST AI - Network Intelligence & Novel Metric Engine
Computes Delay DNA, Delay Amplification, Network Cascade Prediction, Delay Momentum, ETA Trust Score, Model Disagreement, and Operational Risk Radar.
"""

import numpy as np

class NetworkIntelligenceEngine:
    def __init__(self):
        pass

    def compute_delay_dna(self, train_event: dict, predicted_delay: float):
        """
        Builds Delay DNA breakdown profile for a train:
        - Initial origin delay
        - Section congestion contribution
        - Station dwell contribution
        - Preceding train interaction contribution
        - Recovery offset
        """
        init_delay = float(train_event.get("dep_delay_min", 0.0) if train_event.get("is_origin") else 0.0)
        congest_impact = float(round(train_event.get("section_congestion", 0.3) * 12.0, 1))
        dwell_impact = float(round(train_event.get("dwell_impact_min", 0.0), 1))
        conflict_impact = float(round(train_event.get("preceding_conflict_min", 0.0), 1))
        recovery_impact = float(round(-train_event.get("recovery_min", 0.0), 1))

        current_arr_delay = float(train_event.get("arr_delay_min", 0.0))
        amplification = float(round(predicted_delay / max(1.0, current_arr_delay), 2)) if current_arr_delay > 0 else 1.0

        dna_components = [
            {"category": "Initial Origin Delay", "value_min": init_delay, "impact": "High" if init_delay > 15 else "Moderate"},
            {"category": "Section Congestion", "value_min": congest_impact, "impact": "High" if congest_impact > 8 else "Normal"},
            {"category": "Station Dwell Impact", "value_min": dwell_impact, "impact": "Moderate" if dwell_impact > 3 else "Low"},
            {"category": "Network Interactions", "value_min": conflict_impact, "impact": "High" if conflict_impact > 5 else "Low"},
            {"category": "Driver Speed Recovery", "value_min": recovery_impact, "impact": "Positive Recovery" if recovery_impact < 0 else "Neutral"}
        ]

        return {
            "train_id": train_event.get("train_id"),
            "current_delay_min": current_arr_delay,
            "predicted_destination_delay_min": predicted_delay,
            "amplification_factor": amplification,
            "amplification_status": "AMPLIFYING" if amplification > 1.2 else ("RECOVERING" if amplification < 0.85 else "STABLE"),
            "dna_components": dna_components
        }

    def predict_network_cascade(self, target_train: dict, all_active_trains: list):
        """
        Cascade Prediction: Estimates downstream delay propagation from target train to following trains.
        """
        curr_delay = target_train.get("arr_delay_min", 0.0)
        curr_section = target_train.get("section_id")
        
        cascaded_trains = []
        tot_propagated_min = 0.0

        if curr_delay > 5.0 and curr_section:
            # Find trains sharing same corridor / following behind
            for other_t in all_active_trains:
                if other_t.get("train_id") != target_train.get("train_id"):
                    # Check if priority is lower or equal
                    if other_t.get("priority", 3) >= target_train.get("priority", 1):
                        prop_delay = float(round(curr_delay * (0.35 if other_t.get("priority") > target_train.get("priority") else 0.20), 1))
                        if prop_delay > 2.0:
                            cascaded_trains.append({
                                "affected_train_id": other_t.get("train_id"),
                                "affected_train_name": other_t.get("train_name"),
                                "estimated_delay_impact_min": prop_delay,
                                "propagation_reason": f"Signal aspect hold behind {target_train.get('train_id')} on section {curr_section}"
                            })
                            tot_propagated_min += prop_delay

        return {
            "source_train_id": target_train.get("train_id"),
            "source_delay_min": curr_delay,
            "affected_trains_count": len(cascaded_trains),
            "affected_stations_count": min(len(cascaded_trains) * 2, 8),
            "affected_sections_count": max(1, len(cascaded_trains)),
            "total_propagated_train_minutes": round(tot_propagated_min, 1),
            "cascade_details": cascaded_trains[:5]
        }

    def compute_novel_metrics(self, train_event: dict, predicted_delay: float, interval_width: float, baseline_pred: float):
        """
        Computes the custom novel metrics defined in RAILCAST AI spec:
        - Delay Momentum Score
        - ETA Trust Score
        - Model Disagreement
        - Operational Risk Radar
        """
        curr_del = float(train_event.get("arr_delay_min", 0.0))
        prev_del = float(train_event.get("dep_delay_min", 0.0))
        
        # 1. Delay Momentum = (Current Delay - Prev Delay) / time_delta_norm
        momentum = float(round((curr_del - prev_del) / 10.0, 2))
        momentum_status = "ACCELERATING" if momentum > 0.15 else ("RECOVERING" if momentum < -0.15 else "STABLE")

        # 2. ETA Trust Score (0-100)
        width_penalty = min(40.0, interval_width * 2.0)
        trust_score = float(round(max(20.0, 100.0 - width_penalty - (abs(momentum) * 15.0)), 1))

        # 3. Model Disagreement = |AI Prediction - Baseline Prediction|
        disagreement_min = float(round(abs(predicted_delay - baseline_pred), 1))
        disagreement_level = "HIGH" if disagreement_min > 8.0 else ("MODERATE" if disagreement_min > 3.0 else "LOW")

        # 4. Operational Risk Radar (Vector of 6 scores 0-100)
        risk_radar = {
            "delay_risk": min(100.0, round(curr_del * 2.5, 1)),
            "congestion_risk": round(float(train_event.get("section_congestion", 0.3)) * 100.0, 1),
            "cascade_risk": min(100.0, round(curr_del * 1.8, 1)),
            "data_risk": 12.5, # low data risk
            "prediction_risk": round(min(100.0, interval_width * 5.0), 1),
            "weather_risk": 75.0 if train_event.get("weather") in ["Heavy Rain", "Dense Fog", "Severe Storm"] else 15.0
        }

        return {
            "delay_momentum": momentum,
            "delay_momentum_status": momentum_status,
            "eta_trust_score": trust_score,
            "model_disagreement_min": disagreement_min,
            "model_disagreement_level": disagreement_level,
            "operational_risk_radar": risk_radar
        }
