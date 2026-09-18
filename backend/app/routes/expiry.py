from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Dict, Any
from app.database import get_db
from app.models import InventoryBatch, Medicine

router = APIRouter(prefix="/api/expiry", tags=["Expiry Monitor"])

@router.get("/timeline")
def get_expiry_timeline(db: Session = Depends(get_db)):
    today = date.today()
    batches = db.query(InventoryBatch).filter(InventoryBatch.quantity > 0).all()

    in_7_days = []
    in_30_days = []
    in_90_days = []
    beyond_90_days = []

    total_value_at_risk = 0.0

    all_batch_items = []

    for b in batches:
        med = b.medicine
        dte = (b.expiry_date - today).days
        val = round(b.quantity * b.unit_purchase_cost, 2)

        # Recommended clinical supply action
        if dte < 0:
            status = "EXPIRED"
            action = "Quarantine immediately and process write-off"
            total_value_at_risk += val
        elif dte <= 7:
            status = "CRITICAL"
            action = "Prioritize immediate dispensing in ICU/Emergency wards"
            total_value_at_risk += val
        elif dte <= 30:
            status = "WARNING"
            action = "Transfer to high-turnover department & suppress new PO"
            total_value_at_risk += val * 0.7  # Partial risk
        elif dte <= 90:
            status = "MEDIUM"
            action = "First-Expired First-Out (FEFO) dispensing schedule"
        else:
            status = "HEALTHY"
            action = "Maintain regular rotation"

        item = {
            "batch_id": b.id,
            "medicine_id": b.medicine_id,
            "medicine_name": med.name if med else "Unknown",
            "category": med.category if med else "General",
            "criticality": med.criticality if med else "MEDIUM",
            "batch_number": b.batch_number,
            "quantity": b.quantity,
            "unit": med.unit if med else "Units",
            "expiry_date": b.expiry_date.isoformat(),
            "days_remaining": dte,
            "unit_cost": b.unit_purchase_cost,
            "value_at_risk": val,
            "location": b.location,
            "status": status,
            "recommended_action": action
        }

        all_batch_items.append(item)

        if dte <= 7:
            in_7_days.append(item)
        elif dte <= 30:
            in_30_days.append(item)
        elif dte <= 90:
            in_90_days.append(item)
        else:
            beyond_90_days.append(item)

    # Sort each list by days remaining ascending
    all_batch_items.sort(key=lambda x: x["days_remaining"])
    in_7_days.sort(key=lambda x: x["days_remaining"])
    in_30_days.sort(key=lambda x: x["days_remaining"])
    in_90_days.sort(key=lambda x: x["days_remaining"])

    return {
        "summary": {
            "total_batches_monitored": len(batches),
            "expiring_7_days_count": len(in_7_days),
            "expiring_30_days_count": len(in_30_days),
            "expiring_90_days_count": len(in_90_days),
            "total_value_at_risk": round(total_value_at_risk, 2)
        },
        "timeline": {
            "within_7_days": in_7_days,
            "within_30_days": in_30_days,
            "within_90_days": in_90_days,
            "beyond_90_days_count": len(beyond_90_days)
        },
        "all_batches": all_batch_items
    }
