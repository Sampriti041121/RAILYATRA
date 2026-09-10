# 🚆 RAILYATRA — Real-Data Railway Intelligence & Passenger Journey Platform

> **AI Decision-Support Prototype for SIH 2026 / SIH26028**  
> Subtitle: *Real-Time Railway Intelligence & Passenger Journey Platform*  
> AI Engine: **RAILCAST AI**

RAILYATRA is an AI-powered railway spatio-temporal intelligence platform designed for high-density railway networks. Operating under a strict **Real-Data Policy**, RAILYATRA ingests official Indian Railways train timetables, station registries, and historical/live running observations to forecast train arrival times, quantify uncertainty, explain delay root causes using SHAP TreeExplainer, detect section-level operational anomalies, model network delay cascades, and support passenger and operational decision-making.

---

## 🎯 Primary Concept

$$\text{Observe} \rightarrow \text{Understand} \rightarrow \text{Predict} \rightarrow \text{Explain} \rightarrow \text{Detect} \rightarrow \text{Propagate} \rightarrow \text{Simulate} \rightarrow \text{Optimize} \rightarrow \text{Recommend} \rightarrow \text{Evaluate}$$

> **Positioning:** RAILYATRA does not merely report that a train is late. It determines the current railway state, forecasts what happens next, explains the prediction, estimates downstream impact, detects abnormal network behavior, and supports better passenger and operational decisions.

---

## 🔒 1. ABSOLUTE PROJECT RULE: REAL DATA ONLY

The production system **MUST NOT** use synthetic, fabricated, randomized, simulated, placeholder, mock, hard-coded, or invented railway operational data for:
- ML training, validation, or test sets
- Reported model metrics (MAE, RMSE, Coverage)
- Live train positions & live delays
- Network health indices & station states
- Operational risk alerts
- SHAP TreeExplainer attributions
- Data freshness & provenance metrics

When real data or external live API connections are unavailable, the platform displays explicit status states:
- `UNAVAILABLE`
- `STALE`
- `DEGRADED`
- `INSUFFICIENT DATA`
- `LIVE SOURCE NOT CONFIGURED`

*Simulation is strictly isolated to the What-If / Counterfactual decision-support environment and judge demonstration modes.*

---

## 🏗️ 2. SYSTEM ARCHITECTURE

```
RAILYATRA PLATFORM
├── Data Ingestion Layer
│   ├── Official Indian Railways Station Registry (data.gov.in)
│   ├── Official NTES Train Timetable Registry
│   ├── Real Historical Running & Delay Observations
│   └── Pluggable LiveSourceAdapter Interface (RailRadar / Live Telemetry)
├── Persistence & Provenance Layer
│   └── SQLAlchemy ORM (Stations, Sections, Trains, Observations, Live States, Data Sources, Model Provenance)
├── ML & Uncertainty Pipeline (RAILCAST AI)
│   ├── Chronological Journey-Grouped Partitioning (70% Train / 15% Val / 15% Test)
│   ├── Gradient Boosting Regressor (GBDT)
│   ├── Quantile Regressors (P10, P50, P90, P2.5, P97.5)
│   ├── Conformal Prediction Calibrator (Empirical Coverage Guaranteed)
│   ├── Real SHAP TreeExplainer Feature Attributions
│   └── Target Leakage Protection Suite
├── Railway Network Digital Twin & Anomaly Engine
│   ├── NetworkX Directed Graph Topology & Centrality
│   ├── Multi-Train Section Anomaly Classifier (Evidence-Based Diagnostics)
│   └── Delay Cascade Engine (Observed vs Propagated Delay)
├── Decision Support & Passenger Copilot
│   ├── What-If Counterfactual Lab (Explicit Simulation Notices)
│   ├── Passenger GPS Railway Map-Matching Engine
│   └── Grounded Railway Assistant (Fact-Based Responses)
└── Web Application Interface
    ├── FastAPI Backend Service (`/api/v1`)
    └── React + Vite + TypeScript Frontend Command Portal & Passenger View
```

---

## 📊 3. MACHINE LEARNING PIPELINE & UNCERTAINTY

### Temporal Journey Partitioning
- Prevents journey data leakage across train, validation, and test splits.
- Split ratio: **70% Train / 15% Validation / 15% Test** ordered chronologically by journey date.

### Model Benchmarks vs Baselines
- **Primary Model:** Scikit-Learn / LightGBM Gradient Boosting Regressor (`RAILCAST-GB-v2.0`)
- **Baselines Evaluated:**
  1. Timetable Schedule ETA (Zero-Delay Assumption)
  2. Constant Current-Delay Propagation
  3. Historical Station/Section Average Delay
  4. Linear Regression Baseline

### Quantile Regression & Conformal Calibration
- Predicts raw quantiles ($\alpha = 0.10, 0.90, 0.025, 0.975$).
- Calibrated using `ConformalCalibrator` on validation set non-conformity scores:
  $$\text{Coverage}_{80} \ge 80.0\%, \quad \text{Coverage}_{95} \ge 95.0\%$$
- **Removed Fabricated Formulas:** Replaced arbitrary confidence scores with calibrated interval width ($P_{10} \le P_{50} \le P_{90}$).

### Real SHAP Explainability
- Integrates `shap.TreeExplainer` directly on the fitted GBDT tree structure.
- Returns true feature attributions:
  $$\text{Prediction} = \text{Base Value} + \sum \text{SHAP Values}$$

---

## 🛰️ 4. LIVE TRAIN DATA & POSITION FUSION

`PositionFusionEngine` employs a transparent 4-tier hierarchy:
1. **PRIMARY:** Live Railway Telemetry API (via `LiveSourceAdapter`)
2. **SECONDARY:** Verified External Running Status Feed
3. **TERTIARY:** Validated Passenger GPS Map-Matched Observations
4. **LAST:** Schedule-Based Estimation from Last Verified Station Observation

Every live position output includes:
- `status`: `VERIFIED_LIVE`, `ESTIMATED`, `STALE`, `UNAVAILABLE`
- `position_method`
- `source_name`
- `freshness_seconds`

---

## 🛤️ 5. TWO PRODUCT EXPERIENCES

### 📱 RAILYATRA PASSENGER
- Personal railway copilot & journey tracker ("My Journey")
- Dynamic ETA ranges ($P_{10} \dots P_{90}$) and connection risk warnings
- Opt-in Passenger GPS Railway Map-Matching ("I'm on this train")
- Grounded AI Railway Assistant answering natural language queries without hallucinations

### 🎛️ RAILYATRA COMMAND
- Railway Operations Command Center
- Live India Railway Network Graph Visualizer
- Multi-train Section Anomaly Explorer & evidence-based diagnostics
- Delay Cascade Propagation Analysis (Train-minutes at risk)
- Counterfactual What-If Lab for scenario analysis

---

## ⚡ 6. QUICK START & RUNNING LOCALLY

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Backend Setup
```bash
# Ingest data, seed database & train RAILCAST AI pipeline
cd backend
python app/main.py
```
- **FastAPI OpenAPI Documentation:** `http://localhost:8000/docs`
- **System Health Check:** `http://localhost:8000/api/v1/health`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- **Live Platform Interface:** `http://localhost:5173/`

### Execute Acceptance Test Suite
```bash
python -m pytest backend/tests/test_all.py -v
```

---

## 🔬 7. ACCEPTANCE TESTS PASSED

- [x] **Test A — Real Data Ingestion:** Timetables, station registries, & historical datasets loaded with recorded data provenance.
- [x] **Test B — Simulator Isolation:** Fails if synthetic simulator records enter ML training pipeline.
- [x] **Test C — Journey Leakage Protection:** Zero journey ID overlap between train, val, and test partitions.
- [x] **Test D — Target Leakage Protection:** Future station delays & destination arrival fields excluded from feature matrix.
- [x] **Test E — ML Pipeline & Metrics:** MAE, RMSE, Median Error, and Baseline comparisons generated on test set.
- [x] **Test F — Quantile Bounds Ordering:** $P_{10} \le P_{50} \le P_{90}$ with empirical conformal coverage reported.
- [x] **Test G — Real SHAP TreeExplainer:** Feature attributions computed from tree structure.
- [x] **Test H — Live Source Fallback:** Missing API credentials safely return `LIVE SOURCE NOT CONFIGURED` / `UNAVAILABLE`.
- [x] **Test I — Position Fusion Engine:** Transparent source hierarchy and status indicators.
- [x] **Test J — Passenger GPS Matching:** Map-matches device coordinates to railway corridor candidate trains.
- [x] **Test K — Section Health Diagnostics:** Evidence-based classification (`POSSIBLE_INFRASTRUCTURE_ANOMALY`).
- [x] **Test L — Counterfactual Disclaimers:** Explicit `COUNTERFACTUAL SIMULATION` notices on all What-If outputs.
- [x] **Test M — Grounded Assistant:** Fact-based query responses without unverified statements.

---

## ⚠️ Disclaimer

*RAILYATRA is an AI Decision-Support Prototype developed for Smart India Hackathon (SIH26028). It does not claim official affiliation with Indian Railways or the Ministry of Railways unless explicit authorization exists.*
