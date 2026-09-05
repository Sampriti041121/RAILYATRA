"""
RAILCAST AI - Configuration Settings
"""

import os

class Settings:
    PROJECT_NAME: str = "RAILCAST AI"
    VERSION: str = "1.4.0"
    TAGLINE: str = "Predict the arrival. Anticipate the network."
    API_PREFIX: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./railcast.db")
    DEBUG: bool = True
    MODEL_VERSION: str = "RAILCAST-GB-v1.4"
    SECRET_KEY: str = "railcast-ai-secret-key-sih2026"

settings = Settings()
