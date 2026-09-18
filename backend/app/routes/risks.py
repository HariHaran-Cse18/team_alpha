from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models import Medicine, InventoryBatch, ConsumptionHistory, Supplier, PurchaseOrder
from app.schemas import MedicineRiskAssessment, RiskIntelligenceSummary
from app.intelligence import calculate_medicine_risks, detect_usage_anomalies

router = APIRouter(prefix="/api/risks", tags=["Risk Intelligence"])

def evaluate_single_medicine_risk(med: Medicine, db: Session) -> MedicineRiskAssessment:
    today = date.today()

    # Current stock from batches
    batches = db.query(InventoryBatch).filter(InventoryBatch.medicine_id == med.id).all()
    current_stock = sum(b.quantity for b in batches)

    # Earliest expiry
    valid_batches = [b for b in batches if b.quantity > 0]
    if valid_batches:
        earliest_expiry = min(b.expiry_date for b in valid_batches)
        days_to_expiry = (earliest_expiry - today).days
    else:
        days_to_expiry = None

    # Consumption records for anomaly check
    records = db.query(ConsumptionHistory)\
        .filter(ConsumptionHistory.medicine_id == med.id)\
        .order_by(ConsumptionHistory.date.asc())\
        .all()
    
    rec_dicts = [{"date": r.date.isoformat(), "quantity_used": r.quantity_used} for r in records]
    is_abnormal, recent_avg, baseline_avg, surge_pct, anomaly_narrative = detect_usage_anomalies(rec_dicts)

    predicted_daily_usage = max(1.0, recent_avg if recent_avg > 0 else 20.0)

    # Lead time & reliability
    lead_time = med.supplier.average_lead_time if med.supplier else 5
    reliability = med.supplier.reliability_score if med.supplier else 95.0

    # Incoming purchase orders
    incoming_stock = db.query(func.sum(PurchaseOrder.quantity))\
        .filter(PurchaseOrder.medicine_id == med.id, PurchaseOrder.status.in_(["PENDING", "IN_TRANSIT"]))\
        .scalar() or 0

    risk_result = calculate_medicine_risks(
        medicine_name=med.name,
        category=med.category,
        criticality=med.criticality,
        current_stock=current_stock,
        safety_stock=med.safety_stock,
        emergency_reserve=med.emergency_reserve,
        predicted_daily_usage=predicted_daily_usage,
        lead_time_days=lead_time,
        incoming_stock=incoming_stock,
        earliest_expiry_days=days_to_expiry,
        is_usage_abnormal=is_abnormal,
        usage_surge_pct=surge_pct,
        supplier_reliability=reliability
    )

    return MedicineRiskAssessment(
        medicine_id=med.id,
        medicine_name=med.name,
        category=med.category,
        criticality=med.criticality,
        current_stock=current_stock,
        safety_stock=med.safety_stock,
        emergency_reserve=med.emergency_reserve,
        days_remaining=risk_result["days_remaining"],
        stockout_risk=risk_result["stockout_risk"],
        expiry_risk=risk_result["expiry_risk"],
        abnormal_usage_risk=risk_result["abnormal_usage_risk"],
        supplier_delay_risk=risk_result["supplier_delay_risk"],
        reserve_breach_risk=risk_result["reserve_breach_risk"],
        overall_risk=risk_result["overall_risk"],
        overall_risk_score=risk_result["overall_risk_score"],
        factors=risk_result["factors"],
        why_explanation=risk_result["why_explanation"],
        urgent_action_required=risk_result["urgent_action_required"]
    )

@router.get("", response_model=RiskIntelligenceSummary)
def get_risk_summary(db: Session = Depends(get_db)):
    meds = db.query(Medicine).all()
    assessments = [evaluate_single_medicine_risk(m, db) for m in meds]

    critical_c = sum(1 for a in assessments if a.overall_risk == "CRITICAL")
    high_c = sum(1 for a in assessments if a.overall_risk == "HIGH")
    warning_c = sum(1 for a in assessments if a.overall_risk == "WARNING")
    low_c = sum(1 for a in assessments if a.overall_risk == "LOW")

    total = len(assessments)
    avg_score = round(sum(a.overall_risk_score for a in assessments) / total, 1) if total > 0 else 0.0

    # Sort so most critical are at top
    assessments.sort(key=lambda a: a.overall_risk_score, reverse=True)

    return RiskIntelligenceSummary(
        total_analyzed=total,
        critical_count=critical_c,
        high_count=high_c,
        warning_count=warning_c,
        low_count=low_c,
        overall_index=avg_score,
        matrix=assessments
    )

@router.get("/{medicine_id}", response_model=MedicineRiskAssessment)
def get_medicine_risk_details(medicine_id: int, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return evaluate_single_medicine_risk(med, db)
