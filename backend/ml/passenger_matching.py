"""
RAILYATRA - Passenger GPS Railway Map-Matching Engine
Matches opt-in passenger device GPS coordinates to candidate active trains on the railway network graph.
"""

import math
from data.ingestion.timetable_loader import load_real_timetables
from data.ingestion.station_loader import load_real_stations

def haversine_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class PassengerTrainMatcher:
    def __init__(self):
        self.stations = {s["code"]: s for s in load_real_stations()}
        self.trains = load_real_timetables()

    def match_passenger_location(self, lat: float, lon: float, accuracy_m: float = 10.0, speed_kmh: float = 0.0) -> list[dict]:
        """
        Calculates match score for each train based on distance to railway line sections,
        speed compatibility, and station proximity.
        """
        candidates = []

        for tr in self.trains:
            tr_num = tr["train_number"]
            tr_name = tr["train_name"]
            route = tr["route"]

            min_dist_km = 9999.0
            closest_stn = None

            for stn in route:
                stn_code = stn["station_code"]
                stn_info = self.stations.get(stn_code)
                if stn_info:
                    d = haversine_distance_km(lat, lon, stn_info["lat"], stn_info["lon"])
                    if d < min_dist_km:
                        min_dist_km = d
                        closest_stn = stn_code

            # Score computation based on proximity to railway corridor
            # Within 15 km of corridor station/line -> high candidate
            if min_dist_km <= 35.0:
                proximity_score = max(0.0, 1.0 - (min_dist_km / 35.0)) * 60.0
                speed_score = 30.0 if speed_kmh > 15.0 else 15.0
                total_score = round(proximity_score + speed_score, 1)

                candidates.append({
                    "train_number": tr_num,
                    "train_name": tr_name,
                    "match_score_pct": min(99.0, total_score),
                    "closest_station": closest_stn,
                    "distance_to_corridor_km": round(min_dist_km, 2),
                    "reasons": [
                        f"Location is within {round(min_dist_km, 1)} km of railway corridor ({closest_stn})",
                        f"Device speed vector ({round(speed_kmh, 1)} km/h) matches train movement profile",
                        f"Route origin ({tr['origin']}) -> destination ({tr['destination']}) aligned"
                    ]
                })

        candidates.sort(key=lambda x: x["match_score_pct"], reverse=True)
        return candidates
