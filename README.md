# 🚆 RAILCAST AI — Dynamic Railway ETA Forecasting & Causal Operations Intelligence Platform

> **Smart India Hackathon 2026 (SIH26028)**  
> *"Predict the arrival. Anticipate the network."*

RAILCAST AI (RAILYATRA) is an advanced AI-driven railway ETA forecasting and operations intelligence platform designed for high-density passenger and freight railway networks.

---

## 🌟 Key Features

- **Multi-Horizon ETA Trajectory Forecast:** GBDT + Quantile Regressor ML models estimating ETAs with 80% & 95% confidence intervals.
- **Explainable AI (SHAP):** Transparent delay root-cause breakdown ("Delay DNA").
- **Counterfactual "What-If" Simulator:** Interactive dispatcher decision-support tool to test operational interventions.
- **Railway Digital Twin:** Spatio-temporal Network Graph modeling bottlenecks, section congestion, and delay propagation cascades.
- **Data Quality Engine:** Real-time data health scoring and anomaly detection.
- **Interactive Command Center:** Responsive React + TypeScript dashboard with live railway network visualizer and risk alerts.

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI + ML Engine)
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **API Swagger Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/api/v1/health`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- **Live Dashboard:** `http://localhost:5173/`

### 3. Run Tests
```bash
python -m pytest backend/tests/test_all.py -v
```

---

## 🛠️ Tech Stack

- **Backend:** Python 3.10+, FastAPI, Scikit-Learn, LightGBM, NetworkX, SQLAlchemy, SQLite
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Testing:** Pytest

---

## 👥 Contributing & Team Collaboration

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "Add new feature"
   ```
4. **Push to GitHub & create a PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
