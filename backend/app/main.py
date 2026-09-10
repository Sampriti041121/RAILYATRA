import os
import sys

# Ensure backend and repository root directories are in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
repo_root = os.path.dirname(backend_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_and_seed_db
from app.routes import trains, stations, network, predictions, whatif, alerts, analytics, model_intel, data_health, demo, passenger

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Initializing RAILCAST AI Engine...")
    init_and_seed_db()
    yield
    print("👋 Shutting down RAILCAST AI Engine...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=f"{settings.TAGLINE} — Real-Time Railway Intelligence & Passenger Journey Platform (SIH26028).",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under API Prefix
app.include_router(trains.router, prefix=settings.API_PREFIX)
app.include_router(stations.router, prefix=settings.API_PREFIX)
app.include_router(network.router, prefix=settings.API_PREFIX)
app.include_router(predictions.router, prefix=settings.API_PREFIX)
app.include_router(whatif.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(model_intel.router, prefix=settings.API_PREFIX)
app.include_router(data_health.router, prefix=settings.API_PREFIX)
app.include_router(demo.router, prefix=settings.API_PREFIX)
app.include_router(passenger.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "product": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": settings.TAGLINE,
        "docs_url": "/docs",
        "health_check": f"{settings.API_PREFIX}/health"
    }

@app.get(f"{settings.API_PREFIX}/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model_version": settings.MODEL_VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
