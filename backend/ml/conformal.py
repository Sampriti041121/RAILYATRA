"""
RAILYATRA - Conformal Calibration Module
Applies Split Conformal Prediction to guarantee valid empirical prediction interval coverage.
"""

import numpy as np

class ConformalCalibrator:
    def __init__(self, target_coverage: float = 0.80):
        self.target_coverage = target_coverage
        self.q_hat = 0.0

    def calibrate(self, y_val: np.ndarray, low_bounds: np.ndarray, high_bounds: np.ndarray):
        """
        Calculates non-conformity score quantile on validation set.
        """
        y_val = np.array(y_val)
        low_bounds = np.array(low_bounds)
        high_bounds = np.array(high_bounds)

        # Conformal score: maximum under-coverage or over-coverage distance
        scores = np.maximum(low_bounds - y_val, y_val - high_bounds)
        
        n = len(scores)
        if n == 0:
            self.q_hat = 0.0
            return self.q_hat

        # Empirical quantile formula: ceil((n + 1) * alpha) / n
        q_level = np.ceil((n + 1) * self.target_coverage) / n
        q_level = float(np.clip(q_level, 0.0, 1.0))

        self.q_hat = float(np.quantile(scores, q_level, method="higher"))
        return self.q_hat

    def predict_interval(self, low_bound: float, high_bound: float) -> tuple[float, float]:
        """
        Adjusts raw quantile bounds using calibrated q_hat offset.
        """
        cal_low = max(0.0, float(low_bound - self.q_hat))
        cal_high = float(high_bound + self.q_hat)
        cal_high = max(cal_low, cal_high)
        return cal_low, cal_high
