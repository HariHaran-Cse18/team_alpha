from pydantic import BaseModel
from typing import Optional, List

class SimulationRequest(BaseModel):
    medicine_id: int
    daily_demand: float
    supplier_lead_time: int
    current_stock: int
    emergency_reserve: int
    unexpected_demand_surge_percent: float = 0.0 # 0% to 100%
    expiry_horizon_days: int = 60

class SimulationImpactMetric(BaseModel):
    label: str
    before: str
    after: str
    difference: str
    status: str # "IMPROVED", "DEGRADED", "NEUTRAL"

class SimulationResult(BaseModel):
    medicine_id: int
    medicine_name: str
    before_state: dict
    after_state: dict
    impact_metrics: List[SimulationImpactMetric]
    explanation: str
    key_drivers: List[str]
    critical_warning: Optional[str] = None
    action_plan: List[str]
