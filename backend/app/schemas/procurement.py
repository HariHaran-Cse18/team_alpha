from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class RecommendationOut(BaseModel):
    medicine_id: int
    medicine_name: str
    category: str
    criticality: str
    current_stock: int
    daily_usage: float
    forecast_demand_period: int
    safety_stock: int
    emergency_reserve: int
    incoming_stock: int
    lead_time_days: int
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    supplier_reliability: Optional[float] = None
    recommended_quantity: int
    unit: str
    unit_cost: float
    estimated_cost: float
    priority: str # "URGENT", "HIGH", "MEDIUM", "LOW"
    status: str   # "ACTION_REQUIRED", "SUFFICIENT", "EXCESS"
    lead_time_risk: str
    explainable_reasons: List[str]
    formula_breakdown: dict

class PurchaseOrderCreate(BaseModel):
    medicine_id: int
    supplier_id: int
    quantity: int
    priority: Optional[str] = "HIGH"
    notes: Optional[str] = None

class PurchaseOrderOut(BaseModel):
    id: int
    po_number: str
    medicine_id: int
    medicine_name: str
    supplier_id: int
    supplier_name: str
    quantity: int
    unit_price: float
    total_amount: float
    status: str
    priority: str
    order_date: date
    expected_delivery_date: date
    notes: Optional[str] = None

    class Config:
        from_attributes = True
