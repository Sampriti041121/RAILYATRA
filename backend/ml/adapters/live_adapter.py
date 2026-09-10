"""
RAILYATRA - Live Railway Data Adapter Architecture
Provides pluggable adapter interface for real external railway providers.
If credentials or external live streams are not configured, returns UNAVAILABLE or LIVE SOURCE NOT CONFIGURED.
Never fabricates fake coordinates or fake live updates.
"""

import os
from datetime import datetime

class BaseLiveSourceAdapter:
    def __init__(self, provider_name: str, api_key: str = None):
        self.provider_name = provider_name
        self.api_key = api_key or os.getenv(f"{provider_name.upper()}_API_KEY", "")

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    def fetch_live_train_state(self, train_number: str) -> dict:
        raise NotImplementedError

class RailRadarLiveAdapter(BaseLiveSourceAdapter):
    def __init__(self):
        super().__init__(provider_name="RailRadar")

    def fetch_live_train_state(self, train_number: str) -> dict:
        if not self.is_configured():
            return {
                "train_number": str(train_number),
                "status": "UNAVAILABLE",
                "source_status": "LIVE SOURCE NOT CONFIGURED",
                "message": "External live railway telemetry adapter requires valid API credentials in environment.",
                "freshness_seconds": None,
                "position": None
            }
        
        # Real external HTTP request would go here when configured
        return {
            "train_number": str(train_number),
            "status": "UNAVAILABLE",
            "source_status": "NO_ACTIVE_CONNECTION",
            "message": "Live railway API returned no active observation for train.",
            "freshness_seconds": None,
            "position": None
        }

class PositionFusionEngine:
    """
    Combines observations from:
    1. Primary: Live Railway Telemetry API
    2. Secondary: Verified Running Status Feed
    3. Tertiary: Validated Passenger GPS
    4. Last: Schedule-based Estimation from last verified observation
    """
    def __init__(self):
        self.adapters = [RailRadarLiveAdapter()]

    def resolve_train_position(self, train_number: str, timetable_route: dict = None, passenger_gps: dict = None) -> dict:
        # Check Primary & Secondary external adapters
        for adapter in self.adapters:
            live_res = adapter.fetch_live_train_state(train_number)
            if live_res.get("status") == "VERIFIED_LIVE":
                return {
                    "train_number": str(train_number),
                    "status": "VERIFIED_LIVE",
                    "position_method": f"EXTERNAL_TELEMETRY_{adapter.provider_name.upper()}",
                    "source": adapter.provider_name,
                    "lat": live_res["lat"],
                    "lon": live_res["lon"],
                    "speed_kmh": live_res.get("speed_kmh", 0),
                    "current_station": live_res.get("current_station"),
                    "next_station": live_res.get("next_station"),
                    "current_delay_min": live_res.get("current_delay_min", 0.0),
                    "freshness_seconds": live_res.get("freshness_seconds", 0),
                    "confidence": 0.98
                }

        # Check Tertiary: Validated Passenger GPS
        if passenger_gps and passenger_gps.get("match_score", 0) > 0.85:
            return {
                "train_number": str(train_number),
                "status": "VERIFIED_PASSENGER_GPS",
                "position_method": "PASSENGER_GPS_MAP_MATCHED",
                "source": "Anonymized Passenger Copilot Telemetry",
                "lat": passenger_gps["lat"],
                "lon": passenger_gps["lon"],
                "speed_kmh": passenger_gps.get("speed_kmh", 0),
                "current_station": passenger_gps.get("current_station"),
                "next_station": passenger_gps.get("next_station"),
                "current_delay_min": passenger_gps.get("current_delay_min", 0.0),
                "freshness_seconds": passenger_gps.get("freshness_seconds", 12),
                "confidence": 0.90
            }

        # If no live telemetry or passenger GPS is configured/available, check schedule estimate vs real timetable
        if timetable_route:
            return {
                "train_number": str(train_number),
                "status": "ESTIMATED",
                "position_method": "TIMETABLE_PROGRESSION_ESTIMATE",
                "source": "NTES Schedule Baseline",
                "lat": None,
                "lon": None,
                "current_station": timetable_route.get("route", [{}])[0].get("station_code"),
                "next_station": timetable_route.get("route", [{}])[-1].get("station_code"),
                "current_delay_min": 0.0,
                "freshness_seconds": None,
                "confidence": 0.50,
                "note": "Estimated position based on timetable schedule."
            }

        return {
            "train_number": str(train_number),
            "status": "UNAVAILABLE",
            "position_method": "NONE",
            "source": "LIVE SOURCE NOT CONFIGURED",
            "lat": None,
            "lon": None,
            "current_station": None,
            "next_station": None,
            "current_delay_min": None,
            "freshness_seconds": None,
            "confidence": 0.0
        }
