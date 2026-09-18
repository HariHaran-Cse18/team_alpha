from typing import Dict, Any, List, Tuple, Optional
from datetime import date

def calculate_medicine_risks(
    medicine_name: str,
    category: str,
    criticality: str, # CRITICAL, HIGH, MEDIUM, LOW
    current_stock: int,
    safety_stock: int,
    emergency_reserve: int,
    predicted_daily_usage: float,
    lead_time_days: int,
    incoming_stock: int = 0,
    earliest_expiry_days: Optional[int] = None,
    is_usage_abnormal: bool = False,
    usage_surge_pct: float = 0.0,
    supplier_reliability: float = 95.0
) -> Dict[str, Any]:
    """
    Evaluates multi-dimensional risk scores and categories for hospital medicine.
    """
    safe_daily_usage = max(0.5, predicted_daily_usage)
    days_of_stock = round(current_stock / safe_daily_usage, 1)

    # Stockout risk logic
    projected_consumption_during_lead = round(safe_daily_usage * lead_time_days, 1)
    projected_stock = current_stock - projected_consumption_during_lead + incoming_stock

    # Stockout risk level
    if projected_stock <= 0 or days_of_stock <= 1.5:
        stockout_risk = "CRITICAL"
        stockout_score = 98.0
    elif projected_stock < emergency_reserve:
        stockout_risk = "CRITICAL"
        stockout_score = 90.0
    elif projected_stock < safety_stock:
        stockout_risk = "HIGH"
        stockout_score = 75.0
    elif projected_stock < (safety_stock * 1.25) or days_of_stock <= (lead_time_days * 1.3):
        stockout_risk = "WARNING"
        stockout_score = 50.0
    else:
        stockout_risk = "LOW"
        stockout_score = 15.0

    # Expiry risk logic
    if earliest_expiry_days is None:
        expiry_risk = "LOW"
        expiry_score = 10.0
    elif earliest_expiry_days <= 7:
        expiry_risk = "CRITICAL"
        expiry_score = 95.0
    elif earliest_expiry_days <= 30:
        expiry_risk = "WARNING"
        expiry_score = 65.0
    elif earliest_expiry_days <= 90:
        expiry_risk = "MEDIUM"
        expiry_score = 35.0
    else:
        expiry_risk = "LOW"
        expiry_score = 10.0

    # Abnormal usage risk
    if is_usage_abnormal and usage_surge_pct >= 50.0:
        usage_risk = "CRITICAL"
        usage_score = 90.0
    elif is_usage_abnormal or usage_surge_pct >= 25.0:
        usage_risk = "HIGH"
        usage_score = 70.0
    elif usage_surge_pct >= 10.0:
        usage_risk = "WARNING"
        usage_score = 40.0
    else:
        usage_risk = "LOW"
        usage_score = 10.0

    # Supplier delay risk
    if supplier_reliability < 80.0 or lead_time_days >= 10:
        supplier_risk = "HIGH"
        supplier_score = 75.0
    elif supplier_reliability < 90.0 or lead_time_days >= 7:
        supplier_risk = "MEDIUM"
        supplier_score = 45.0
    else:
        supplier_risk = "LOW"
        supplier_score = 15.0

    # Emergency reserve breach risk
    if current_stock < emergency_reserve:
        reserve_risk = "CRITICAL"
        reserve_score = 100.0
    elif projected_stock < emergency_reserve:
        reserve_risk = "CRITICAL"
        reserve_score = 90.0
    elif current_stock < (emergency_reserve * 1.3):
        reserve_risk = "WARNING"
        reserve_score = 55.0
    else:
        reserve_risk = "LOW"
        reserve_score = 10.0

    # Criticality weight multiplier
    criticality_mult = {
        "CRITICAL": 1.3,
        "HIGH": 1.15,
        "MEDIUM": 1.0,
        "LOW": 0.85
    }.get(criticality.upper(), 1.0)

    # Weighted overall score
    raw_composite = (
        stockout_score * 0.35 +
        reserve_score * 0.25 +
        usage_score * 0.15 +
        expiry_score * 0.15 +
        supplier_score * 0.10
    ) * criticality_mult

    overall_score = min(100.0, max(0.0, round(raw_composite, 1)))

    if stockout_risk == "CRITICAL" or reserve_risk == "CRITICAL" or overall_score >= 80.0:
        overall_risk = "CRITICAL"
    elif stockout_risk == "HIGH" or overall_score >= 60.0:
        overall_risk = "HIGH"
    elif stockout_risk == "WARNING" or expiry_risk == "WARNING" or overall_score >= 35.0:
        overall_risk = "WARNING"
    else:
        overall_risk = "LOW"

    # Build explainability factors
    factors = [
        {"category": "STOCKOUT", "score": stockout_score, "level": stockout_risk,
         "description": f"Current stock covers {days_of_stock} days; supplier lead time is {lead_time_days} days."},
        {"category": "EXPIRY", "score": expiry_score, "level": expiry_risk,
         "description": f"Earliest batch expires in {earliest_expiry_days} days." if earliest_expiry_days is not None else "No imminent expiry risk."},
        {"category": "ABNORMAL_USAGE", "score": usage_score, "level": usage_risk,
         "description": f"Demand deviation is {usage_surge_pct:+.1f}% vs historical normal."},
        {"category": "SUPPLIER_DELAY", "score": supplier_score, "level": supplier_risk,
         "description": f"Supplier delivery reliability is {supplier_reliability}% with {lead_time_days}-day lead time."},
        {"category": "EMERGENCY_RESERVE", "score": reserve_score, "level": reserve_risk,
         "description": f"Target reserve {emergency_reserve} units; projected balance is {int(projected_stock)} units."}
    ]

    why_reasons = []
    if stockout_risk in ("CRITICAL", "HIGH"):
        why_reasons.append(f"Stock coverage ({days_of_stock} days) is less than or dangerously close to supplier lead time ({lead_time_days} days).")
    if reserve_risk == "CRITICAL":
        why_reasons.append(f"Projected stock ({int(projected_stock)} units) falls below mandatory Emergency Reserve ({emergency_reserve} units).")
    if usage_risk in ("CRITICAL", "HIGH"):
        why_reasons.append(f"Consumption escalated rapidly ({usage_surge_pct:+.1f}%), outpacing standard replenishment cycles.")
    if expiry_risk in ("CRITICAL", "WARNING") and earliest_expiry_days:
        why_reasons.append(f"Active batch expires in {earliest_expiry_days} days; prioritizing dispensing or reallocation required.")
    if supplier_risk in ("CRITICAL", "HIGH"):
        why_reasons.append(f"Supplier fulfillment history indicates delay volatility ({supplier_reliability}% on-time).")
    if not why_reasons:
        why_reasons.append("Inventory levels comfortably exceed safety stock and supplier fulfillment window is stable.")

    return {
        "days_remaining": days_of_stock,
        "projected_stock": int(projected_stock),
        "stockout_risk": stockout_risk,
        "expiry_risk": expiry_risk,
        "abnormal_usage_risk": usage_risk,
        "supplier_delay_risk": supplier_risk,
        "reserve_breach_risk": reserve_risk,
        "overall_risk": overall_risk,
        "overall_risk_score": overall_score,
        "factors": factors,
        "why_explanation": why_reasons,
        "urgent_action_required": overall_risk in ("CRITICAL", "HIGH")
    }
