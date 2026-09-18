import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "MEDORA AI"
    TAGLINE: str = "Predict. Prevent. Procure."
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./medora.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "medora-hackathon-secure-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DEFAULT_LEAD_TIME_BUFFER: float = 1.2
    EMERGENCY_RESERVE_SAFETY_FACTOR: float = 1.0

settings = Settings()
