from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class SupplierOut(BaseModel):
    id: int
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    average_lead_time: int
    reliability_score: float
    rating: float
    quality_compliance: float
    items_supplied_count: int = 0
    pending_orders_count: int = 0
    delay_risk: str # "LOW", "MEDIUM", "HIGH"

    class Config:
        from_attributes = True

class AlertOut(BaseModel):
    id: int
    severity: str # CRITICAL, WARNING, EXPIRY, INFO
    title: str
    message: str
    medicine_id: Optional[int] = None
    medicine_name: Optional[str] = None
    action_type: Optional[str] = None
    is_read: bool
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_resolved: Optional[bool] = None
