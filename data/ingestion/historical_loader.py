"""
RAILYATRA - Historical Delay Ingestion Loader
Loads real historical operational delay logs for ML training and evaluation.
"""

import os
import pandas as pd

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HISTORICAL_FILE = os.path.join(DATA_DIR, "historical_running", "ir_historical_delays.csv")

def load_real_historical_dataset() -> pd.DataFrame:
    if not os.path.exists(HISTORICAL_FILE):
        from data.ingestion.build_real_dataset import build_real_historical_dataset
        build_real_historical_dataset()
    df = pd.read_csv(HISTORICAL_FILE)
    return df
