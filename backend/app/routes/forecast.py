from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models import Medicine, ConsumptionHistory
from app.schemas import MedicineForecastOut
from app.intelligence import train_and_forecast_demand

router = APIRouter(prefix="/api/forecast", tags=["Demand Forecasting"])

@router.get("/{medicine_id}", response_model=MedicineForecastOut)
def get_medicine_forecast(
    medicine_id: int,
    horizon: int = Query(14, ge=7, le=60),
    db: Session = Depends(get_db)
):
    med = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    # Fetch 90-day history
    records = db.query(ConsumptionHistory)\
        .filter(ConsumptionHistory.medicine_id == medicine_id)\
        .order_by(ConsumptionHistory.date.asc())\
        .all()

    record_dicts = [
        {"date": r.date.isoformat(), "quantity_used": r.quantity_used, "is_abnormal": r.is_abnormal}
        for r in records
    ]

    (
        historical_points,
        forecast_points,
        current_avg,
        predicted_avg,
        change_pct,
        trend,
        confidence_level,
        factors
    ) = train_and_forecast_demand(record_dicts, horizon_days=horizon)

    # Human-readable explanation
    if trend == "Increasing":
        explanation = f"Demand for {med.name} is accelerating by {change_pct:+.1f}%. Recent clinical consumption velocity indicates an upward trend requiring buffer expansion."
    elif trend == "Decreasing":
        explanation = f"Demand for {med.name} is easing by {abs(change_pct):.1f}%. Consumption is stabilizing below recent peak rates."
    else:
        explanation = f"Demand for {med.name} is currently stable within expected hospital operational variance (±5%)."

    return {
        "medicine_id": med.id,
        "medicine_name": med.name,
        "category": med.category,
        "horizon_days": horizon,
        "current_avg_daily": current_avg,
        "predicted_avg_daily": predicted_avg,
        "demand_change_percent": change_pct,
        "trend": trend,
        "confidence_level": confidence_level,
        "historical_points": historical_points,
        "forecast_points": forecast_points,
        "explanation": explanation,
        "factors": factors
    }

@router.get("", response_model=List[dict])
def get_all_forecast_summaries(db: Session = Depends(get_db)):
    meds = db.query(Medicine).all()
    summaries = []
    for med in meds:
        # Quick 7-day average
        records = db.query(ConsumptionHistory)\
            .filter(ConsumptionHistory.medicine_id == med.id)\
            .order_by(ConsumptionHistory.date.desc())\
            .limit(14)\
            .all()
        if records:
            last_7 = [r.quantity_used for r in records[:7]]
            prev_7 = [r.quantity_used for r in records[7:]]
            avg_curr = sum(last_7) / len(last_7) if last_7 else 20.0
            avg_prev = sum(prev_7) / len(prev_7) if prev_7 else avg_curr
            pct = round(((avg_curr - avg_prev) / max(1.0, avg_prev)) * 100, 1)
            trend = "Increasing" if pct > 5 else ("Decreasing" if pct < -5 else "Stable")
        else:
            avg_curr = 20.0
            pct = 0.0
            trend = "Stable"

        summaries.append({
            "medicine_id": med.id,
            "medicine_name": med.name,
            "category": med.category,
            "criticality": med.criticality,
            "current_avg_daily": round(avg_curr, 1),
            "projected_daily": round(avg_curr * (1 + pct / 100.0), 1),
            "change_pct": pct,
            "trend": trend
        })
    return summaries
