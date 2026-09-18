from pydantic import BaseModel
from typing import List, Optional

class RiskFactor(BaseModel):
    category: str # "STOCKOUT", "EXPIRY", "ABNORMAL_USAGE", "SUPPLIER_DELAY", "EMERGENCY_RESERVE"
    score: float  # 0 to 100
    level: str    # "CRITICAL", "HIGH", "WARNING", "LOW"
    description: str

class MedicineRiskAssessment(BaseModel):
    medicine_id: int
    medicine_name: str
    category: str
    criticality: str
    current_stock: int
    safety_stock: int
    emergency_reserve: int
    days_remaining: float
    stockout_risk: str
    expiry_risk: str
    abnormal_usage_risk: str
    supplier_delay_risk: str
    reserve_breach_risk: str
    overall_risk: str
    overall_risk_score: float
    factors: List[RiskFactor]
    why_explanation: List[str]
    urgent_action_required: bool

class RiskIntelligenceSummary(BaseModel):
    total_analyzed: int
    critical_count: int
    high_count: int
    warning_count: int
    low_count: int
    overall_index: float
    matrix: List[MedicineRiskAssessment]
