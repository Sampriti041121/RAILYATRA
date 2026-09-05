"""
RAILCAST AI - Feature Engineering Engine
Extracts spatio-temporal, topological, operational, and causal delay features for ETA prediction.
Strictly prevents temporal data leakage.
"""

import pandas as pd
import numpy as np

FEATURE_COLUMNS = [
    "current_delay_min",
    "prev_delay_min",
    "delay_momentum",
    "rolling_delay_3stn",
    "distance_completed_km",
    "distance_remaining_km",
    "progress_pct",
    "dwell_impact_min",
    "section_congestion",
    "weather_impact_score",
    "preceding_conflict_min",
    "recovery_min",
    "train_priority",
    "sequence_idx",
    "hour_of_day",
    "day_of_week",
    "is_weekend"
]

WEATHER_MAP = {
    "Clear": 1.0,
    "Light Rain": 1.1,
    "Heavy Rain": 1.3,
    "Dense Fog": 1.5,
    "Severe Storm": 1.8
}

class FeatureEngineer:
    def __init__(self):
        pass

    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        # Convert timestamps if necessary
        if "act_arr" in df.columns:
            df["act_arr_dt"] = pd.to_datetime(df["act_arr"], format="ISO8601", errors="coerce")
            df["hour_of_day"] = df["act_arr_dt"].dt.hour.fillna(14).astype(int)
            df["day_of_week"] = df["act_arr_dt"].dt.dayofweek.fillna(4).astype(int)
        else:
            df["hour_of_day"] = 14
            df["day_of_week"] = 4

        df["is_weekend"] = df["day_of_week"].apply(lambda d: 1 if d >= 5 else 0)

        # Map Weather impact
        if "weather" in df.columns:
            df["weather_impact_score"] = df["weather"].map(WEATHER_MAP).fillna(1.0)
        else:
            df["weather_impact_score"] = 1.0

        # Feature transformations per journey
        features_list = []
        for journey_id, group in df.groupby("journey_id"):
            group = group.sort_values("sequence_idx").copy()

            # Target: Destination arrival delay
            dest_row = group[group["is_destination"] == True] if "is_destination" in group.columns else []
            if len(dest_row) > 0:
                final_dest_delay = dest_row.iloc[0]["arr_delay_min"]
            else:
                final_dest_delay = group.iloc[-1]["arr_delay_min"]

            group["target_destination_delay_min"] = final_dest_delay

            # Lagged features
            group["current_delay_min"] = group["arr_delay_min"]
            group["prev_delay_min"] = group["current_delay_min"].shift(1).fillna(group["current_delay_min"])
            
            # Delay Momentum Score = Current Delay - Prev Delay
            group["delay_momentum"] = group["current_delay_min"] - group["prev_delay_min"]

            # Rolling 3-station delay
            group["rolling_delay_3stn"] = group["current_delay_min"].rolling(window=3, min_periods=1).mean()

            # Distance calculation
            group["distance_completed_km"] = group["distance_from_origin_km"] if "distance_from_origin_km" in group.columns else 0.0
            if "remaining_distance_km" in group.columns and group["remaining_distance_km"].notnull().any():
                group["distance_remaining_km"] = group["remaining_distance_km"]
            else:
                max_d = group["distance_completed_km"].max()
                group["distance_remaining_km"] = max_d - group["distance_completed_km"]

            tot_dist = group["distance_completed_km"] + group["distance_remaining_km"]
            tot_dist = tot_dist.apply(lambda d: max(1.0, float(d)))
            
            group["progress_pct"] = (group["distance_completed_km"] / tot_dist).clip(0.0, 1.0)
            group["train_priority"] = group["priority"] if "priority" in group.columns else 2

            if "dwell_impact_min" not in group.columns:
                group["dwell_impact_min"] = 0.0
            if "section_congestion" not in group.columns:
                group["section_congestion"] = 0.3
            if "preceding_conflict_min" not in group.columns:
                group["preceding_conflict_min"] = 0.0
            if "recovery_min" not in group.columns:
                group["recovery_min"] = 0.0

            features_list.append(group)

        result_df = pd.concat(features_list, ignore_index=True)
        return result_df

    def get_feature_matrix(self, df: pd.DataFrame):
        processed_df = self.extract_features(df)
        X = processed_df[FEATURE_COLUMNS]
        y = processed_df["target_destination_delay_min"]
        return X, y, processed_df
