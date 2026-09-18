from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class BatchOut(BaseModel):
    id: int
    batch_number: str
    quantity: int
    received_date: date
    expiry_date: date
    days_to_expiry: int
    unit_purchase_cost: float
    location: str
    status: str # HEALTHY, EXPIRING_SOON, CRITICAL, EXPIRED

    class Config:
        from_attributes = True

class MedicineBase(BaseModel):
    name: str
    generic_name: Optional[str] = None
    category: str
    dosage_form: str
    unit: str
    unit_cost: float
    criticality: str
    minimum_stock: int
    safety_stock: int
    emergency_reserve: int
    supplier_id: Optional[int] = None
    description: Optional[str] = None
    storage_conditions: Optional[str] = "Store below 25°C"

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    dosage_form: Optional[str] = None
    unit: Optional[str] = None
    unit_cost: Optional[float] = None
    criticality: Optional[str] = None
    minimum_stock: Optional[int] = None
    safety_stock: Optional[int] = None
    emergency_reserve: Optional[int] = None
    supplier_id: Optional[int] = None

class MedicineOut(MedicineBase):
    id: int
    current_stock: int
    total_batches: int
    earliest_expiry: Optional[date] = None
    days_to_expiry: Optional[int] = None
    daily_usage: float
    days_remaining: float
    stockout_risk: str
    expiry_risk: str
    supplier_name: Optional[str] = None
    supplier_lead_time: Optional[int] = None
    batches: List[BatchOut] = []

    class Config:
        from_attributes = True
