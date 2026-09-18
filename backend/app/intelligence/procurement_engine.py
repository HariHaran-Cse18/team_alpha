import math
from typing import Dict, Any, List, Optional

def calculate_procurement_recommendation(
    medicine_id: int,
    medicine_name: str,
    category: str,
    criticality: str,
    current_stock: int,
    predicted_daily_usage: float,
    safety_stock: int,
    emergency_reserve: int,
    lead_time_days: int,
    unit: str,
    unit_cost: float,
    incoming_stock: int = 0,
    review_period_days: int = 7,
    supplier_id: Optional[int] = None,
    supplier_name: Optional[str] = None,
    supplier_reliability: Optional[float] = 95.0,
    demand_surge_pct: float = 0.0
) -> Dict[str, Any]:
    """
    Intelligent hospital procurement decision engine.
    Calculates exact replenishment quantities and explainable clinical supply chain justification.
    """
    safe_daily = max(0.5, predicted_daily_usage)
    coverage_days = lead_time_days + review_period_days
    forecast_demand_during_period = int(math.ceil(safe_daily * coverage_days))

    # Target buffer logic
    total_target = forecast_demand_during_period + safety_stock + emergency_reserve
    net_available = current_stock + incoming_stock
    raw_order = total_target - net_available

    recommended_quantity = max(0, int(math.ceil(raw_order)))

    # Priority determination
    days_of_stock = current_stock / safe_daily
    if current_stock <= emergency_reserve or days_of_stock <= lead_time_days:
        priority = "URGENT"
        status = "ACTION_REQUIRED"
    elif current_stock <= safety_stock or days_of_stock <= (lead_time_days * 1.5):
        priority = "HIGH"
        status = "ACTION_REQUIRED"
    elif recommended_quantity > 0:
        priority = "MEDIUM"
        status = "ACTION_REQUIRED"
    else:
        priority = "LOW"
        status = "SUFFICIENT"

    if criticality.upper() == "CRITICAL" and priority == "HIGH":
        priority = "URGENT"

    estimated_cost = round(recommended_quantity * unit_cost, 2)

    # Lead time risk
    if lead_time_days >= 8 or (supplier_reliability and supplier_reliability < 85.0):
        lead_time_risk = "HIGH"
    elif lead_time_days >= 5:
        lead_time_risk = "MEDIUM"
    else:
        lead_time_risk = "LOW"

    # Explainable reasons
    explainable_reasons = []
    if recommended_quantity > 0:
        explainable_reasons.append(
            f"Forecast consumption across lead ({lead_time_days}d) & review cycle ({review_period_days}d) requires {forecast_demand_during_period} units."
        )
        if days_of_stock <= lead_time_days:
            explainable_reasons.append(
                f"Current stock ({current_stock} {unit}) provides only {days_of_stock:.1f} days of coverage, which is less than supplier lead time ({lead_time_days} days)."
            )
        if current_stock < emergency_reserve:
            explainable_reasons.append(
                f"Current inventory is currently breaching the mandatory hospital Emergency Reserve of {emergency_reserve} units."
            )
        elif current_stock < safety_stock:
            explainable_reasons.append(
                f"Inventory is operating below safety threshold ({safety_stock} units)."
            )
        if demand_surge_pct > 15.0:
            explainable_reasons.append(
                f"Anticipating demand surge of +{demand_surge_pct:.1f}% based on recent ward admissions and consumption velocity."
            )
        if incoming_stock > 0:
            explainable_reasons.append(
                f"Credited {incoming_stock} units already in-transit via active purchase orders."
            )
        else:
            explainable_reasons.append("Zero pending purchase orders detected in supply pipeline.")
    else:
        explainable_reasons.append(
            f"Current stock ({current_stock} units) plus incoming ({incoming_stock} units) satisfies demand ({forecast_demand_during_period} units) and reserve buffers."
        )

    formula_breakdown = {
        "daily_rate": round(safe_daily, 1),
        "lead_time_days": lead_time_days,
        "review_period_days": review_period_days,
        "forecast_demand": forecast_demand_during_period,
        "safety_reserve": safety_stock,
        "emergency_reserve": emergency_reserve,
        "current_stock": current_stock,
        "incoming_stock": incoming_stock,
        "target_stock": total_target,
        "recommended_quantity": recommended_quantity
    }

    return {
        "medicine_id": medicine_id,
        "medicine_name": medicine_name,
        "category": category,
        "criticality": criticality,
        "current_stock": current_stock,
        "daily_usage": round(safe_daily, 1),
        "forecast_demand_period": forecast_demand_during_period,
        "safety_stock": safety_stock,
        "emergency_reserve": emergency_reserve,
        "incoming_stock": incoming_stock,
        "lead_time_days": lead_time_days,
        "supplier_id": supplier_id,
        "supplier_name": supplier_name or "MedSupply Corp",
        "supplier_reliability": supplier_reliability,
        "recommended_quantity": recommended_quantity,
        "unit": unit,
        "unit_cost": unit_cost,
        "estimated_cost": estimated_cost,
        "priority": priority,
        "status": status,
        "lead_time_risk": lead_time_risk,
        "explainable_reasons": explainable_reasons,
        "formula_breakdown": formula_breakdown
    }
