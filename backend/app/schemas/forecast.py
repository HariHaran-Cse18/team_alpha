from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class HistoricalPoint(BaseModel):
    date: str
    actual: int
    is_abnormal: bool = False

class ForecastPoint(BaseModel):
    date: str
    predicted: float
    lower_bound: float
    upper_bound: float
    confidence: float = 0.95

class MedicineForecastOut(BaseModel):
    medicine_id: int
    medicine_name: str
    category: str
    horizon_days: int
    current_avg_daily: float
    predicted_avg_daily: float
    demand_change_percent: float
    trend: str  # "Increasing", "Decreasing", "Stable"
    confidence_level: str
    historical_points: List[HistoricalPoint]
    forecast_points: List[ForecastPoint]
    explanation: str
    factors: List[str]
