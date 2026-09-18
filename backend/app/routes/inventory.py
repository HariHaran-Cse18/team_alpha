from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models import Medicine, InventoryBatch, ConsumptionHistory, Supplier, PurchaseOrder
from app.schemas import MedicineCreate, MedicineUpdate, MedicineOut, BatchOut
from app.intelligence import calculate_medicine_risks

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

def get_medicine_enriched(med: Medicine, db: Session) -> dict:
    today = date.today()
    
    # Calculate current stock from batches
    batches = db.query(InventoryBatch).filter(InventoryBatch.medicine_id == med.id).all()
    current_stock = sum(b.quantity for b in batches)

    # Earliest expiry
    valid_batches = [b for b in batches if b.quantity > 0]
    if valid_batches:
        earliest_batch = min(valid_batches, key=lambda b: b.expiry_date)
        earliest_expiry = earliest_batch.expiry_date
        days_to_expiry = (earliest_expiry - today).days
    else:
        earliest_expiry = None
        days_to_expiry = None

    # Calculate average daily usage from last 7 days
    recent_date = today - timedelta(days=7)
    recent_usage = db.query(func.avg(ConsumptionHistory.quantity_used))\
        .filter(ConsumptionHistory.medicine_id == med.id, ConsumptionHistory.date >= recent_date)\
        .scalar()
    daily_usage = float(recent_usage) if recent_usage is not None else 20.0
    daily_usage = max(1.0, round(daily_usage, 1))

    days_remaining = round(current_stock / daily_usage, 1)

    # Lead time
    lead_time = med.supplier.average_lead_time if med.supplier else 5
    reliability = med.supplier.reliability_score if med.supplier else 95.0

    # Incoming stock
    incoming_stock = db.query(func.sum(PurchaseOrder.quantity))\
        .filter(PurchaseOrder.medicine_id == med.id, PurchaseOrder.status.in_(["PENDING", "IN_TRANSIT"]))\
        .scalar() or 0

    risk_info = calculate_medicine_risks(
        medicine_name=med.name,
        category=med.category,
        criticality=med.criticality,
        current_stock=current_stock,
        safety_stock=med.safety_stock,
        emergency_reserve=med.emergency_reserve,
        predicted_daily_usage=daily_usage,
        lead_time_days=lead_time,
        incoming_stock=incoming_stock,
        earliest_expiry_days=days_to_expiry,
        supplier_reliability=reliability
    )

    batch_outs = []
    for b in batches:
        dte = (b.expiry_date - today).days
        if dte < 0:
            st = "EXPIRED"
        elif dte <= 7:
            st = "CRITICAL"
        elif dte <= 30:
            st = "EXPIRING_SOON"
        else:
            st = "HEALTHY"
        
        batch_outs.append({
            "id": b.id,
            "batch_number": b.batch_number,
            "quantity": b.quantity,
            "received_date": b.received_date,
            "expiry_date": b.expiry_date,
            "days_to_expiry": dte,
            "unit_purchase_cost": b.unit_purchase_cost,
            "location": b.location,
            "status": st
        })

    return {
        "id": med.id,
        "name": med.name,
        "generic_name": med.generic_name,
        "category": med.category,
        "dosage_form": med.dosage_form,
        "unit": med.unit,
        "unit_cost": med.unit_cost,
        "criticality": med.criticality,
        "minimum_stock": med.minimum_stock,
        "safety_stock": med.safety_stock,
        "emergency_reserve": med.emergency_reserve,
        "supplier_id": med.supplier_id,
        "supplier_name": med.supplier.name if med.supplier else None,
        "supplier_lead_time": lead_time,
        "description": med.description,
        "storage_conditions": med.storage_conditions,
        "current_stock": current_stock,
        "total_batches": len(batches),
        "earliest_expiry": earliest_expiry,
        "days_to_expiry": days_to_expiry,
        "daily_usage": daily_usage,
        "days_remaining": days_remaining,
        "stockout_risk": risk_info["stockout_risk"],
        "expiry_risk": risk_info["expiry_risk"],
        "batches": batch_outs
    }

@router.get("", response_model=List[MedicineOut])
def get_all_inventory(
    category: Optional[str] = None,
    criticality: Optional[str] = None,
    risk: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Medicine)
    if category and category != "All":
        query = query.filter(Medicine.category == category)
    if criticality and criticality != "All":
        query = query.filter(Medicine.criticality == criticality)
    if search:
        query = query.filter(Medicine.name.ilike(f"%{search}%") | Medicine.generic_name.ilike(f"%{search}%"))

    meds = query.all()
    results = [get_medicine_enriched(m, db) for m in meds]

    if risk and risk != "All":
        results = [r for r in results if r["stockout_risk"] == risk or r["expiry_risk"] == risk]

    return results

@router.get("/{id}", response_model=MedicineOut)
def get_inventory_item(id: int, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return get_medicine_enriched(med, db)

@router.post("", response_model=MedicineOut)
def create_inventory_item(item: MedicineCreate, db: Session = Depends(get_db)):
    existing = db.query(Medicine).filter(Medicine.name == item.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A medicine with this name already exists")
    
    med = Medicine(**item.dict())
    db.add(med)
    db.commit()
    db.refresh(med)

    # Create initial batch
    init_batch = InventoryBatch(
        medicine_id=med.id,
        batch_number=f"INIT-{med.id}-{int(datetime.utcnow().timestamp()) % 10000}",
        quantity=item.minimum_stock,
        received_date=date.today(),
        expiry_date=date.today() + timedelta(days=180),
        unit_purchase_cost=item.unit_cost,
        location="Main Pharmacy"
    )
    db.add(init_batch)

    # Initial historical consumption baseline
    for i in range(14, 0, -1):
        db.add(ConsumptionHistory(
            medicine_id=med.id,
            date=date.today() - timedelta(days=i),
            quantity_used=max(5, item.minimum_stock // 15),
            department="General Ward",
            is_abnormal=False
        ))
    db.commit()

    return get_medicine_enriched(med, db)

@router.put("/{id}", response_model=MedicineOut)
def update_inventory_item(id: int, item: MedicineUpdate, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    for field, value in item.dict(exclude_unset=True).items():
        setattr(med, field, value)
    
    db.commit()
    return get_medicine_enriched(med, db)

@router.delete("/{id}")
def delete_inventory_item(id: int, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db.delete(med)
    db.commit()
    return {"status": "success", "message": f"Medicine {med.name} removed successfully"}
