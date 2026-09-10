"""
RAILYATRA - Timetable Ingestion Loader
Reads official Indian Railways timetable datasets.
"""

import os
import json

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TIMETABLE_FILE = os.path.join(DATA_DIR, "timetable", "ir_timetable.json")

def load_real_timetables():
    if not os.path.exists(TIMETABLE_FILE):
        raise FileNotFoundError(f"Timetable database missing at {TIMETABLE_FILE}")
    with open(TIMETABLE_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

def get_train_by_number(train_number: str):
    trains = load_real_timetables()
    for tr in trains:
        if str(tr["train_number"]) == str(train_number):
            return tr
    return None
