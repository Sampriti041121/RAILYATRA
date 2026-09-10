"""
RAILYATRA - Station Data Ingestion Loader
Reads real verified Indian Railways station records.
"""

import os
import json
import pandas as pd

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
STATIONS_FILE = os.path.join(DATA_DIR, "stations", "ir_stations.json")

def load_real_stations():
    if not os.path.exists(STATIONS_FILE):
        raise FileNotFoundError(f"Station database missing at {STATIONS_FILE}")
    with open(STATIONS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

def get_station_by_code(code: str):
    stations = load_real_stations()
    for stn in stations:
        if stn["code"].upper() == code.upper():
            return stn
    return None
