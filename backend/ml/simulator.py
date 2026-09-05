"""
RAILCAST AI - Realistic Causal Railway Operations Simulator
Generates synthetic operational railway data with strict causal and spatio-temporal delay propagation dependencies.
"""

import os
import random
import math
import json
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Indian Railway Corridors Baseline Data
CORRIDORS = {
    "NDLS_HWH_TRUNK": [
        {"code": "NDLS", "name": "New Delhi", "lat": 28.6424, "lon": 77.2195, "dist": 0},
        {"code": "CNB", "name": "Kanpur Central", "lat": 26.4542, "lon": 80.3500, "dist": 440},
        {"code": "PRYJ", "name": "Prayagraj Junction", "lat": 25.4358, "lon": 81.8463, "dist": 635},
        {"code": "DDU", "name": "Pt. DD Upadhyaya Jn", "lat": 25.2818, "lon": 83.1152, "dist": 788},
        {"code": "PNBE", "name": "Patna Junction", "lat": 25.6093, "lon": 85.1376, "dist": 999},
        {"code": "ASN", "name": "Asansol Junction", "lat": 23.6833, "lon": 86.9833, "dist": 1235},
        {"code": "HWH", "name": "Howrah Junction", "lat": 22.5839, "lon": 88.3431, "dist": 1447}
    ],
    "CSMT_MAS_TRUNK": [
        {"code": "CSMT", "name": "Mumbai CSMT", "lat": 18.9401, "lon": 72.8347, "dist": 0},
        {"code": "PUNE", "name": "Pune Junction", "lat": 18.5289, "lon": 73.8744, "dist": 192},
        {"code": "SUR", "name": "Solapur Junction", "lat": 17.6599, "lon": 75.9064, "dist": 455},
        {"code": "WADI", "name": "Wadi Junction", "lat": 17.0427, "lon": 76.9934, "dist": 605},
        {"code": "GTL", "name": "Guntakal Junction", "lat": 15.1674, "lon": 77.3789, "dist": 834},
        {"code": "RU", "name": "Renigunta Junction", "lat": 13.6333, "lon": 79.5167, "dist": 1144},
        {"code": "MAS", "name": "Chennai Central", "lat": 13.0827, "lon": 80.2707, "dist": 1285}
    ],
    "SBC_NDLS_EXPRESS": [
        {"code": "SBC", "name": "KSR Bengaluru", "lat": 12.9781, "lon": 77.5694, "dist": 0},
        {"code": "DMM", "name": "Dharmavaram Junction", "lat": 14.4142, "lon": 77.7126, "dist": 180},
        {"code": "SC", "name": "Secunderabad Junction", "lat": 17.4339, "lon": 78.5017, "dist": 622},
        {"code": "BPQ", "name": "Balharshah Junction", "lat": 19.8500, "lon": 79.3500, "dist": 989},
        {"code": "NGP", "name": "Nagpur Junction", "lat": 21.1500, "lon": 79.0888, "dist": 1200},
        {"code": "BPL", "name": "Bhopal Junction", "lat": 23.2599, "lon": 77.4126, "dist": 1590},
        {"code": "VGLJ", "name": "VGW Jhansi Junction", "lat": 25.4484, "lon": 78.5685, "dist": 1882},
        {"code": "GWL", "name": "Gwalior Junction", "lat": 26.2183, "lon": 78.1828, "dist": 1979},
        {"code": "AGC", "name": "Agra Cantt", "lat": 27.1597, "lon": 77.9942, "dist": 2097},
        {"code": "NZM", "name": "Hazrat Nizamuddin", "lat": 28.5892, "lon": 77.2514, "dist": 2285}
    ]
}

TRAIN_CLASSES = [
    {"type": "Vande Bharat Express", "speed_kmh": 110, "priority": 1, "dwell_min": 2, "recovery_factor": 0.85},
    {"type": "Rajdhani / Shatabdi", "speed_kmh": 100, "priority": 1, "dwell_min": 3, "recovery_factor": 0.80},
    {"type": "Superfast Express", "speed_kmh": 85, "priority": 2, "dwell_min": 5, "recovery_factor": 0.60},
    {"type": "Mail / Express", "speed_kmh": 70, "priority": 3, "dwell_min": 7, "recovery_factor": 0.40},
    {"type": "Passenger Special", "speed_kmh": 50, "priority": 4, "dwell_min": 10, "recovery_factor": 0.20}
]

WEATHER_CONDITIONS = ["Clear", "Light Rain", "Heavy Rain", "Dense Fog", "Severe Storm"]
WEATHER_IMPACT = {
    "Clear": 1.0,
    "Light Rain": 1.08,
    "Heavy Rain": 1.25,
    "Dense Fog": 1.50,
    "Severe Storm": 1.80
}

class RailwaySimulator:
    def __init__(self, seed: int = 42):
        random.seed(seed)
        np.random.seed(seed)
        self.stations = self._generate_stations()
        self.sections = self._generate_sections()
        self.train_routes = self._generate_train_routes()

    def _generate_stations(self):
        stations_dict = {}
        for corridor_name, stn_list in CORRIDORS.items():
            for idx, stn in enumerate(stn_list):
                if stn["code"] not in stations_dict:
                    stations_dict[stn["code"]] = {
                        "code": stn["code"],
                        "name": stn["name"],
                        "lat": stn["lat"],
                        "lon": stn["lon"],
                        "corridor": corridor_name,
                        "platforms": random.randint(4, 12),
                        "congestion_index": round(random.uniform(0.1, 0.4), 2)
                    }
        # Add intermediate minor stations to reach 100+ stations
        minor_count = 0
        base_stns = list(stations_dict.values())
        for i in range(len(base_stns) - 1):
            s1 = base_stns[i]
            s2 = base_stns[i+1]
            # Create 4 minor stations between consecutive major stations
            n_sub = 5
            for j in range(1, n_sub):
                minor_count += 1
                code = f"STN_{s1['code']}_{j}"
                name = f"{s1['name']} Sub-{j}"
                frac = j / float(n_sub)
                lat = round(s1['lat'] + (s2['lat'] - s1['lat']) * frac + random.uniform(-0.02, 0.02), 4)
                lon = round(s1['lon'] + (s2['lon'] - s1['lon']) * frac + random.uniform(-0.02, 0.02), 4)
                stations_dict[code] = {
                    "code": code,
                    "name": name,
                    "lat": lat,
                    "lon": lon,
                    "corridor": s1['corridor'],
                    "platforms": random.randint(2, 4),
                    "congestion_index": round(random.uniform(0.05, 0.3), 2)
                }
        return stations_dict

    def _generate_sections(self):
        sections = []
        # Group stations by corridor order
        for corridor_name, stn_list in CORRIDORS.items():
            # filter stations belonging to corridor
            c_stns = [s for s in self.stations.values() if s["corridor"] == corridor_name]
            # sort by latitude/longitude distance progression
            c_stns.sort(key=lambda s: (s["lat"], s["lon"]))
            for idx in range(len(c_stns) - 1):
                from_stn = c_stns[idx]
                to_stn = c_stns[idx+1]
                # calculate approx distance
                dist = math.sqrt((to_stn["lat"]-from_stn["lat"])**2 + (to_stn["lon"]-from_stn["lon"])**2) * 111.0
                dist = max(round(dist, 1), 8.0)
                sec_id = f"SEC_{from_stn['code']}_{to_stn['code']}"
                sections.append({
                    "section_id": sec_id,
                    "from_station": from_stn["code"],
                    "to_station": to_stn["code"],
                    "distance_km": dist,
                    "max_speed_kmh": random.choice([110, 130, 160]),
                    "tracks": random.choice([2, 2, 3, 4]),
                    "base_capacity": random.randint(40, 90),
                    "current_congestion": round(random.uniform(0.1, 0.6), 2),
                    "weather": random.choice(WEATHER_CONDITIONS)
                })
        return sections

    def _generate_train_routes(self):
        trains = []
        train_id_counter = 12001
        for corridor_name, stn_list in CORRIDORS.items():
            # Get full chain of stations in this corridor
            c_stns = [s for s in self.stations.values() if s["corridor"] == corridor_name]
            c_stns.sort(key=lambda s: (s["lat"], s["lon"]))
            
            # Generate 35 trains per corridor (total ~105 trains)
            for t_idx in range(35):
                t_cls = random.choice(TRAIN_CLASSES)
                t_num = str(train_id_counter)
                train_id_counter += 1
                
                direction = random.choice(["FORWARD", "REVERSE"])
                route_stns = c_stns if direction == "FORWARD" else list(reversed(c_stns))
                
                # Pick origin & destination (can be full length or sub-segment)
                start_i = random.randint(0, min(2, len(route_stns)-4))
                end_i = random.randint(max(start_i+4, len(route_stns)-3), len(route_stns)-1)
                t_route = route_stns[start_i:end_i+1]
                
                trains.append({
                    "train_id": t_num,
                    "train_name": f"{t_route[0]['name'].split()[0]}-{t_route[-1]['name'].split()[0]} {t_cls['type']}",
                    "train_type": t_cls["type"],
                    "priority": t_cls["priority"],
                    "max_speed": t_cls["speed_kmh"],
                    "base_dwell_min": t_cls["dwell_min"],
                    "recovery_factor": t_cls["recovery_factor"],
                    "route": [s["code"] for s in t_route]
                })
        return trains

    def simulate_journeys(self, num_days: int = 14, scale: str = "MEDIUM"):
        """
        Simulate journeys with realistic causal delay propagation:
        - Initial origin delays (weather, locomotive, boarding)
        - Section speed restriction & congestion interaction
        - Following-train conflict (if Train B is behind delayed Train A in section X, Train B accumulates waiting delay)
        - Dwell escalation at high-congested stations
        - Driver speed recovery on open sections
        """
        events = []
        start_date = datetime(2026, 8, 1, 6, 0, 0)
        
        # Keep track of section occupancy timelines for train interaction
        section_occupancy = {} # (section_id, time_bucket) -> list of (train_id, exit_time, priority)
        
        journey_id_counter = 1
        
        for day in range(num_days):
            current_day_date = start_date + timedelta(days=day)
            
            # Select subset of trains running today
            daily_trains = random.sample(self.train_routes, min(len(self.train_routes), 80))
            
            for train in daily_trains:
                j_id = f"JRN_{journey_id_counter:06d}"
                journey_id_counter += 1
                
                # Base departure time spread across day
                departure_hour = random.randint(5, 22)
                departure_min = random.choice([0, 15, 30, 45])
                sched_dep = current_day_date.replace(hour=departure_hour, minute=departure_min, second=0)
                
                # Initial delay at origin
                weather = random.choice(WEATHER_CONDITIONS)
                init_delay = 0
                if random.random() < 0.35:
                    init_delay = float(np.random.exponential(scale=12.0) if weather == "Clear" else np.random.exponential(scale=25.0))
                    init_delay = min(max(0.0, init_delay), 180.0)
                
                curr_actual_time = sched_dep + timedelta(minutes=init_delay)
                accumulated_delay = init_delay
                
                route_stns = train["route"]
                
                for i in range(len(route_stns)):
                    stn_code = route_stns[i]
                    stn_meta = self.stations[stn_code]
                    
                    if i == 0:
                        # Origin Station
                        arr_sched = sched_dep
                        arr_act = curr_actual_time
                        dwell_sched = train["base_dwell_min"]
                        dwell_act = dwell_sched + (random.uniform(1, 5) if accumulated_delay > 15 else random.uniform(0, 2))
                        dep_sched = arr_sched + timedelta(minutes=dwell_sched)
                        dep_act = arr_act + timedelta(minutes=dwell_act)
                        curr_actual_time = dep_act
                        
                        events.append({
                            "journey_id": j_id,
                            "train_id": train["train_id"],
                            "train_name": train["train_name"],
                            "train_type": train["train_type"],
                            "priority": train["priority"],
                            "station_code": stn_code,
                            "station_name": stn_meta["name"],
                            "sequence_idx": i,
                            "is_origin": True,
                            "is_destination": False,
                            "sched_arr": arr_sched.isoformat(),
                            "act_arr": arr_act.isoformat(),
                            "arr_delay_min": round((arr_act - arr_sched).total_seconds() / 60.0, 1),
                            "sched_dep": dep_sched.isoformat(),
                            "act_dep": dep_act.isoformat(),
                            "dep_delay_min": round((dep_act - dep_sched).total_seconds() / 60.0, 1),
                            "dwell_sched_min": dwell_sched,
                            "dwell_act_min": round(dwell_act, 1),
                            "dwell_impact_min": round(dwell_act - dwell_sched, 1),
                            "section_id": None,
                            "section_congestion": stn_meta["congestion_index"],
                            "weather": weather,
                            "preceding_conflict_min": 0.0,
                            "recovery_min": 0.0,
                            "distance_from_origin_km": 0.0,
                            "remaining_distance_km": 1000.0 # updated later
                        })
                    else:
                        prev_stn = route_stns[i-1]
                        sec_id = f"SEC_{prev_stn}_{stn_code}"
                        
                        # Find section distance or estimate
                        dist_km = 45.0
                        sec_info = next((s for s in self.sections if s["from_station"] == prev_stn and s["to_station"] == stn_code), None)
                        if sec_info:
                            dist_km = sec_info["distance_km"]
                        
                        # Calculate scheduled traversal runtime (min)
                        avg_speed = train["max_speed"] * 0.8
                        sched_runtime_min = (dist_km / avg_speed) * 60.0
                        arr_sched = datetime.fromisoformat(events[-1]["sched_dep"]) + timedelta(minutes=sched_runtime_min)
                        
                        # Causal Section Modifiers:
                        # 1. Congestion impact
                        sec_congest = round(random.uniform(0.1, 0.85), 2)
                        congestion_delay = (sec_congest ** 2) * (dist_km / 10.0) * random.uniform(0.8, 1.5)
                        
                        # 2. Weather impact
                        weather_mult = WEATHER_IMPACT[weather]
                        weather_delay = (sched_runtime_min * (weather_mult - 1.0))
                        
                        # 3. Preceding train conflict (Causal spatial dependency)
                        conflict_delay = 0.0
                        time_bucket = (curr_actual_time.hour, curr_actual_time.minute // 15)
                        occ_key = (sec_id, time_bucket)
                        if occ_key in section_occupancy:
                            # Section is occupied by earlier trains
                            for prev_t_id, prev_exit, prev_prio in section_occupancy[occ_key]:
                                if prev_prio <= train["priority"]: # Lower priority gets delayed more
                                    conflict_delay += random.uniform(3.0, 12.0)
                        
                        # Record occupancy
                        exit_est = curr_actual_time + timedelta(minutes=sched_runtime_min + congestion_delay + conflict_delay)
                        if occ_key not in section_occupancy:
                            section_occupancy[occ_key] = []
                        section_occupancy[occ_key].append((train["train_id"], exit_est, train["priority"]))
                        
                        # 4. Operator Speed Recovery (if train is late and priority is high)
                        recovery_min = 0.0
                        current_delay_before_sec = (curr_actual_time - datetime.fromisoformat(events[-1]["sched_dep"])).total_seconds() / 60.0
                        if current_delay_before_sec > 10 and sec_congest < 0.4 and weather == "Clear":
                            recovery_min = min(current_delay_before_sec * 0.2, sched_runtime_min * train["recovery_factor"] * 0.25)
                        
                        act_runtime_min = max(sched_runtime_min * 0.8, sched_runtime_min + congestion_delay + weather_delay + conflict_delay - recovery_min)
                        
                        arr_act = curr_actual_time + timedelta(minutes=act_runtime_min)
                        arr_delay = (arr_act - arr_sched).total_seconds() / 60.0
                        
                        # Dwell time calculation
                        is_dest = (i == len(route_stns) - 1)
                        if is_dest:
                            dwell_sched = 0
                            dwell_act = 0
                            dep_sched = arr_sched
                            dep_act = arr_act
                        else:
                            dwell_sched = train["base_dwell_min"]
                            dwell_extra = (0.5 * (arr_delay / 10.0)) if arr_delay > 10 else 0
                            dwell_act = dwell_sched + dwell_extra + random.uniform(0, 2)
                            dep_sched = arr_sched + timedelta(minutes=dwell_sched)
                            dep_act = arr_act + timedelta(minutes=dwell_act)
                            curr_actual_time = dep_act
                        
                        events.append({
                            "journey_id": j_id,
                            "train_id": train["train_id"],
                            "train_name": train["train_name"],
                            "train_type": train["train_type"],
                            "priority": train["priority"],
                            "station_code": stn_code,
                            "station_name": stn_meta["name"],
                            "sequence_idx": i,
                            "is_origin": False,
                            "is_destination": is_dest,
                            "sched_arr": arr_sched.isoformat(),
                            "act_arr": arr_act.isoformat(),
                            "arr_delay_min": round(arr_delay, 1),
                            "sched_dep": dep_sched.isoformat(),
                            "act_dep": dep_act.isoformat(),
                            "dep_delay_min": round((dep_act - dep_sched).total_seconds() / 60.0, 1),
                            "dwell_sched_min": dwell_sched,
                            "dwell_act_min": round(dwell_act, 1),
                            "dwell_impact_min": round(dwell_act - dwell_sched, 1),
                            "section_id": sec_id,
                            "section_congestion": round(sec_congest, 2),
                            "weather": weather,
                            "preceding_conflict_min": round(conflict_delay, 1),
                            "recovery_min": round(recovery_min, 1),
                            "distance_from_origin_km": 0.0, # filled in next pass
                            "remaining_distance_km": 0.0
                        })
        
        df = pd.DataFrame(events)
        
        # Post-process distance accumulation per journey
        for j_id, group in df.groupby("journey_id"):
            tot_dist = 0.0
            dist_acc = [0.0]
            indices = group.index.tolist()
            for idx_pos in range(1, len(indices)):
                prev_i = indices[idx_pos - 1]
                curr_i = indices[idx_pos]
                s_from = df.loc[prev_i, "station_code"]
                s_to = df.loc[curr_i, "station_code"]
                sec = next((s for s in self.sections if s["from_station"] == s_from and s["to_station"] == s_to), None)
                d = sec["distance_km"] if sec else 45.0
                tot_dist += d
                dist_acc.append(round(tot_dist, 1))
            
            for idx_pos, idx_val in enumerate(indices):
                df.loc[idx_val, "distance_from_origin_km"] = dist_acc[idx_pos]
                df.loc[idx_val, "remaining_distance_km"] = round(tot_dist - dist_acc[idx_pos], 1)
        
        return df

if __name__ == "__main__":
    sim = RailwaySimulator()
    print(f"Generated {len(sim.stations)} stations, {len(sim.sections)} sections, {len(sim.train_routes)} train routes.")
    df_journeys = sim.simulate_journeys(num_days=3)
    print(f"Simulated {len(df_journeys)} operational events across {df_journeys['journey_id'].nunique()} train journeys.")
