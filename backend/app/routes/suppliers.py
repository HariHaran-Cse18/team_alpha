from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import Supplier, Medicine, PurchaseOrder
from app.schemas import SupplierOut

router = APIRouter(prefix="/api/suppliers", tags=["Supplier Intelligence"])

@router.get("", response_model=List[SupplierOut])
def get_all_suppliers(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    results = []

    for s in suppliers:
        items_count = db.query(Medicine).filter(Medicine.supplier_id == s.id).count()
        pending_count = db.query(PurchaseOrder).filter(
            PurchaseOrder.supplier_id == s.id,
            PurchaseOrder.status.in_(["PENDING", "IN_TRANSIT"])
        ).count()

        # Delay risk calculation
        if s.reliability_score < 85.0 or s.average_lead_time >= 9:
            delay_risk = "HIGH"
        elif s.reliability_score < 92.0 or s.average_lead_time >= 6:
            delay_risk = "MEDIUM"
        else:
            delay_risk = "LOW"

        results.append({
            "id": s.id,
            "name": s.name,
            "contact_person": s.contact_person,
            "email": s.email,
            "phone": s.phone,
            "average_lead_time": s.average_lead_time,
            "reliability_score": s.reliability_score,
            "rating": s.rating,
            "quality_compliance": s.quality_compliance,
            "items_supplied_count": items_count,
            "pending_orders_count": pending_count,
            "delay_risk": delay_risk
        })

    return results

@router.get("/{id}")
def get_supplier_details(id: int, db: Session = Depends(get_db)):
    s = db.query(Supplier).filter(Supplier.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")

    medicines = db.query(Medicine).filter(Medicine.supplier_id == s.id).all()
    orders = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == s.id).order_by(PurchaseOrder.order_date.desc()).all()

    return {
        "id": s.id,
        "name": s.name,
        "contact_person": s.contact_person,
        "email": s.email,
        "phone": s.phone,
        "average_lead_time": s.average_lead_time,
        "reliability_score": s.reliability_score,
        "rating": s.rating,
        "quality_compliance": s.quality_compliance,
        "supplied_medicines": [
            {"id": m.id, "name": m.name, "category": m.category, "criticality": m.criticality, "unit_cost": m.unit_cost}
            for m in medicines
        ],
        "recent_orders": [
            {
                "id": o.id,
                "po_number": o.po_number,
                "medicine_name": o.medicine.name if o.medicine else "Unknown",
                "quantity": o.quantity,
                "total_amount": o.total_amount,
                "status": o.status,
                "expected_delivery_date": o.expected_delivery_date
            }
            for o in orders[:5]
        ]
    }
