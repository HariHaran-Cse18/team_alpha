from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models import Medicine, InventoryBatch, ConsumptionHistory, Supplier, PurchaseOrder, Alert
from app.schemas import RecommendationOut, PurchaseOrderCreate, PurchaseOrderOut
from app.intelligence import calculate_procurement_recommendation, detect_usage_anomalies

router = APIRouter(prefix="/api/procurement", tags=["Smart Procurement Center"])

@router.get("/recommendations", response_model=List[RecommendationOut])
def get_procurement_recommendations(db: Session = Depends(get_db)):
    meds = db.query(Medicine).all()
    recommendations = []

    for med in meds:
        batches = db.query(InventoryBatch).filter(InventoryBatch.medicine_id == med.id).all()
        current_stock = sum(b.quantity for b in batches)

        # 7-day consumption average
        recent_date = date.today() - timedelta(days=7)
        recent_usage = db.query(func.avg(ConsumptionHistory.quantity_used))\
            .filter(ConsumptionHistory.medicine_id == med.id, ConsumptionHistory.date >= recent_date)\
            .scalar()
        daily_usage = float(recent_usage) if recent_usage is not None else 20.0

        # Check anomaly surge
        history = db.query(ConsumptionHistory)\
            .filter(ConsumptionHistory.medicine_id == med.id)\
            .order_by(ConsumptionHistory.date.asc())\
            .all()
        h_dicts = [{"date": h.date.isoformat(), "quantity_used": h.quantity_used} for h in history]
        _, _, _, surge_pct, _ = detect_usage_anomalies(h_dicts)

        # Incoming stock
        incoming = db.query(func.sum(PurchaseOrder.quantity))\
            .filter(PurchaseOrder.medicine_id == med.id, PurchaseOrder.status.in_(["PENDING", "IN_TRANSIT"]))\
            .scalar() or 0

        lead_time = med.supplier.average_lead_time if med.supplier else 5
        supplier_name = med.supplier.name if med.supplier else "MedSupply Corp"
        supplier_rel = med.supplier.reliability_score if med.supplier else 94.0

        rec = calculate_procurement_recommendation(
            medicine_id=med.id,
            medicine_name=med.name,
            category=med.category,
            criticality=med.criticality,
            current_stock=current_stock,
            predicted_daily_usage=daily_usage,
            safety_stock=med.safety_stock,
            emergency_reserve=med.emergency_reserve,
            lead_time_days=lead_time,
            unit=med.unit,
            unit_cost=med.unit_cost,
            incoming_stock=incoming,
            review_period_days=7,
            supplier_id=med.supplier_id,
            supplier_name=supplier_name,
            supplier_reliability=supplier_rel,
            demand_surge_pct=surge_pct
        )
        recommendations.append(rec)

    # Sort priority: URGENT first, then HIGH, then MEDIUM, then LOW
    priority_order = {"URGENT": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    recommendations.sort(key=lambda x: (priority_order.get(x["priority"], 99), -x["recommended_quantity"]))

    return recommendations

@router.get("/orders", response_model=List[PurchaseOrderOut])
def get_all_purchase_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(PurchaseOrder)
    if status and status != "All":
        query = query.filter(PurchaseOrder.status == status)
    orders = query.order_by(PurchaseOrder.created_at.desc()).all()

    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "po_number": o.po_number,
            "medicine_id": o.medicine_id,
            "medicine_name": o.medicine.name if o.medicine else "Unknown",
            "supplier_id": o.supplier_id,
            "supplier_name": o.supplier.name if o.supplier else "Unknown",
            "quantity": o.quantity,
            "unit_price": o.unit_price,
            "total_amount": o.total_amount,
            "status": o.status,
            "priority": o.priority,
            "order_date": o.order_date,
            "expected_delivery_date": o.expected_delivery_date,
            "notes": o.notes
        })
    return result

@router.post("/orders", response_model=PurchaseOrderOut)
def create_purchase_order(po_in: PurchaseOrderCreate, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == po_in.medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    supplier = db.query(Supplier).filter(Supplier.id == po_in.supplier_id).first()
    if not supplier:
        supplier = med.supplier
        if not supplier:
            supplier = db.query(Supplier).first()

    today = date.today()
    expected_delivery = today + timedelta(days=supplier.average_lead_time if supplier else 5)

    po_count = db.query(PurchaseOrder).count()
    po_num = f"PO-2026-{1100 + po_count + 1}"

    new_po = PurchaseOrder(
        po_number=po_num,
        medicine_id=med.id,
        supplier_id=supplier.id,
        quantity=po_in.quantity,
        unit_price=med.unit_cost,
        total_amount=round(po_in.quantity * med.unit_cost, 2),
        status="PENDING",
        priority=po_in.priority or "HIGH",
        order_date=today,
        expected_delivery_date=expected_delivery,
        notes=po_in.notes or f"Automated procurement decision for {med.name}."
    )
    db.add(new_po)

    # Create associated notification alert
    alert = Alert(
        severity="INFO",
        title=f"Purchase Order Generated: {po_num}",
        message=f"Created PO for {po_in.quantity} {med.unit} of {med.name} with {supplier.name}. Expected delivery in {supplier.average_lead_time} days ({expected_delivery}).",
        medicine_id=med.id,
        action_type="PROCURE",
        is_read=False
    )
    db.add(alert)
    db.commit()
    db.refresh(new_po)

    return {
        "id": new_po.id,
        "po_number": new_po.po_number,
        "medicine_id": new_po.medicine_id,
        "medicine_name": med.name,
        "supplier_id": supplier.id,
        "supplier_name": supplier.name,
        "quantity": new_po.quantity,
        "unit_price": new_po.unit_price,
        "total_amount": new_po.total_amount,
        "status": new_po.status,
        "priority": new_po.priority,
        "order_date": new_po.order_date,
        "expected_delivery_date": new_po.expected_delivery_date,
        "notes": new_po.notes
    }

@router.put("/orders/{id}/status")
def update_po_status(id: int, status: str, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    old_status = po.status
    po.status = status.upper()

    # If delivered, ingest into inventory as a new batch!
    if po.status == "DELIVERED" and old_status != "DELIVERED":
        po.actual_delivery_date = date.today()
        new_batch = InventoryBatch(
            medicine_id=po.medicine_id,
            batch_number=f"DELIV-{po.po_number}",
            quantity=po.quantity,
            received_date=date.today(),
            expiry_date=date.today() + timedelta(days=240), # 8 months shelf life
            unit_purchase_cost=po.unit_price,
            location="Central Pharmacy Inbound"
        )
        db.add(new_batch)

    db.commit()
    return {"status": "success", "new_status": po.status, "message": f"PO {po.po_number} marked as {po.status}"}
