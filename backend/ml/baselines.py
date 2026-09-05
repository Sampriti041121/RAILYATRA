"""
RAILCAST AI - ETA Baseline Models
Provides 5 baseline benchmarks to compare against primary AI models.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

class TimetableBaseline:
    """Baseline 1: Static timetable (assumes zero future delay, target delay = current delay or 0)"""
    def predict(self, X):
        return np.zeros(len(X))

class CurrentDelayBaseline:
    """Baseline 2: Timetable + Current Delay (assumes current delay remains constant until destination)"""
    def predict(self, X):
        return X["current_delay_min"].values

class HistoricalAverageBaseline:
    """Baseline 3: Historical average section delay baseline"""
    def __init__(self):
        self.mean_delay = 12.0

    def fit(self, X, y):
        self.mean_delay = float(np.mean(y))

    def predict(self, X):
        return np.full(len(X), self.mean_delay)

class RollingAverageBaseline:
    """Baseline 4: Rolling 3-station delay baseline"""
    def predict(self, X):
        return X["rolling_delay_3stn"].values

class SimpleLinearRegressionBaseline:
    """Baseline 5: Simple 2-feature Linear Regression (current delay + distance remaining)"""
    def __init__(self):
        self.model = LinearRegression()

    def fit(self, X, y):
        cols = ["current_delay_min", "distance_remaining_km"]
        self.model.fit(X[cols].fillna(0), y)

    def predict(self, X):
        cols = ["current_delay_min", "distance_remaining_km"]
        return self.model.predict(X[cols].fillna(0))

def evaluate_baselines(X_train, y_train, X_test, y_test):
    results = {}

    # Baseline 1
    b1 = TimetableBaseline()
    preds1 = b1.predict(X_test)
    results["Static Timetable"] = {
        "MAE": float(round(mean_absolute_error(y_test, preds1), 2)),
        "RMSE": float(round(np.sqrt(mean_squared_error(y_test, preds1)), 2))
    }

    # Baseline 2
    b2 = CurrentDelayBaseline()
    preds2 = b2.predict(X_test)
    results["Timetable + Current Delay"] = {
        "MAE": float(round(mean_absolute_error(y_test, preds2), 2)),
        "RMSE": float(round(np.sqrt(mean_squared_error(y_test, preds2)), 2))
    }

    # Baseline 3
    b3 = HistoricalAverageBaseline()
    b3.fit(X_train, y_train)
    preds3 = b3.predict(X_test)
    results["Historical Average"] = {
        "MAE": float(round(mean_absolute_error(y_test, preds3), 2)),
        "RMSE": float(round(np.sqrt(mean_squared_error(y_test, preds3)), 2))
    }

    # Baseline 4
    b4 = RollingAverageBaseline()
    preds4 = b4.predict(X_test)
    results["Rolling Average"] = {
        "MAE": float(round(mean_absolute_error(y_test, preds4), 2)),
        "RMSE": float(round(np.sqrt(mean_squared_error(y_test, preds4)), 2))
    }

    # Baseline 5
    b5 = SimpleLinearRegressionBaseline()
    b5.fit(X_train, y_train)
    preds5 = b5.predict(X_test)
    results["Simple Linear Regression"] = {
        "MAE": float(round(mean_absolute_error(y_test, preds5), 2)),
        "RMSE": float(round(np.sqrt(mean_squared_error(y_test, preds5)), 2))
    }

    return results
