import math
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import Dict, Any, List
from app.database import get_db
from app.models import Medicine, InventoryBatch, ConsumptionHistory, Supplier, PurchaseOrder, Alert
from app.schemas import SimulationRequest, SimulationResult, SimulationImpactMetric
from app.intelligence import calculate_medicine_risks, calculate_procurement_recommendation

router = APIRouter(prefix="/api/simulation", tags=["What-If Simulator"])

@router.post("/what-if", response_model=SimulationResult)
def run_what_if_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == req.medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    # BASELINE (BEFORE) STATE
    batches = db.query(InventoryBatch).filter(InventoryBatch.medicine_id == med.id).all()
    actual_current_stock = sum(b.quantity for b in batches)
    
    # 7-day average usage
    recent_date = date.today() - timedelta(days=7)
    recent_usage = db.query(func.avg(ConsumptionHistory.quantity_used))\
        .filter(ConsumptionHistory.medicine_id == med.id, ConsumptionHistory.date >= recent_date)\
        .scalar()
    baseline_daily = float(recent_usage) if recent_usage is not None else 40.0
    baseline_lead = med.supplier.average_lead_time if med.supplier else 5
    baseline_reserve = med.emergency_reserve
    baseline_safety = med.safety_stock
    incoming_stock = db.query(func.sum(PurchaseOrder.quantity))\
        .filter(PurchaseOrder.medicine_id == med.id, PurchaseOrder.status.in_(["PENDING", "IN_TRANSIT"]))\
        .scalar() or 0

    before_risk = calculate_medicine_risks(
        medicine_name=med.name,
        category=med.category,
        criticality=med.criticality,
        current_stock=actual_current_stock,
        safety_stock=baseline_safety,
        emergency_reserve=baseline_reserve,
        predicted_daily_usage=baseline_daily,
        lead_time_days=baseline_lead,
        incoming_stock=incoming_stock,
        earliest_expiry_days=60
    )

    before_rec = calculate_procurement_recommendation(
        medicine_id=med.id,
        medicine_name=med.name,
        category=med.category,
        criticality=med.criticality,
        current_stock=actual_current_stock,
        predicted_daily_usage=baseline_daily,
        safety_stock=baseline_safety,
        emergency_reserve=baseline_reserve,
        lead_time_days=baseline_lead,
        unit=med.unit,
        unit_cost=med.unit_cost,
        incoming_stock=incoming_stock
    )

    before_state = {
        "daily_demand": round(baseline_daily, 1),
        "supplier_lead_time": baseline_lead,
        "current_stock": actual_current_stock,
        "emergency_reserve": baseline_reserve,
        "days_remaining": before_risk["days_remaining"],
        "stockout_risk": before_risk["stockout_risk"],
        "reserve_risk": before_risk["reserve_breach_risk"],
        "overall_risk": before_risk["overall_risk"],
        "recommended_order": before_rec["recommended_quantity"],
        "estimated_cost": before_rec["estimated_cost"]
    }

    # SIMULATED (AFTER) STATE
    surge_mult = 1.0 + (req.unexpected_demand_surge_percent / 100.0)
    effective_sim_daily = max(0.5, round(req.daily_demand * surge_mult, 1))
    sim_stock = max(0, req.current_stock)
    sim_lead = max(1, req.supplier_lead_time)
    sim_reserve = max(0, req.emergency_reserve)

    after_risk = calculate_medicine_risks(
        medicine_name=med.name,
        category=med.category,
        criticality=med.criticality,
        current_stock=sim_stock,
        safety_stock=baseline_safety,
        emergency_reserve=sim_reserve,
        predicted_daily_usage=effective_sim_daily,
        lead_time_days=sim_lead,
        incoming_stock=incoming_stock,
        earliest_expiry_days=req.expiry_horizon_days,
        usage_surge_pct=req.unexpected_demand_surge_percent
    )

    after_rec = calculate_procurement_recommendation(
        medicine_id=med.id,
        medicine_name=med.name,
        category=med.category,
        criticality=med.criticality,
        current_stock=sim_stock,
        predicted_daily_usage=effective_sim_daily,
        safety_stock=baseline_safety,
        emergency_reserve=sim_reserve,
        lead_time_days=sim_lead,
        unit=med.unit,
        unit_cost=med.unit_cost,
        incoming_stock=incoming_stock,
        demand_surge_pct=req.unexpected_demand_surge_percent
    )

    after_state = {
        "daily_demand": effective_sim_daily,
        "supplier_lead_time": sim_lead,
        "current_stock": sim_stock,
        "emergency_reserve": sim_reserve,
        "days_remaining": after_risk["days_remaining"],
        "stockout_risk": after_risk["stockout_risk"],
        "reserve_risk": after_risk["reserve_breach_risk"],
        "overall_risk": after_risk["overall_risk"],
        "recommended_order": after_rec["recommended_quantity"],
        "estimated_cost": after_rec["estimated_cost"]
    }

    # Impact Metrics Calculation
    impact_metrics = [
        SimulationImpactMetric(
            label="Stockout Risk Level",
            before=before_state["stockout_risk"],
            after=after_state["stockout_risk"],
            difference="Escalated" if after_state["stockout_risk"] in ("CRITICAL", "HIGH") and before_state["stockout_risk"] not in ("CRITICAL", "HIGH") else "Unchanged",
            status="DEGRADED" if after_state["stockout_risk"] in ("CRITICAL", "HIGH") else "NEUTRAL"
        ),
        SimulationImpactMetric(
            label="Stock Coverage (Days)",
            before=f"{before_state['days_remaining']} days",
            after=f"{after_state['days_remaining']} days",
            difference=f"{round(after_state['days_remaining'] - before_state['days_remaining'], 1):+} days",
            status="DEGRADED" if after_state["days_remaining"] < before_state["days_remaining"] else "IMPROVED"
        ),
        SimulationImpactMetric(
            label="Recommended Procurement Order",
            before=f"{before_state['recommended_order']} {med.unit}",
            after=f"{after_state['recommended_order']} {med.unit}",
            difference=f"{after_state['recommended_order'] - before_state['recommended_order']:+d} {med.unit}",
            status="DEGRADED" if after_state["recommended_order"] > before_state["recommended_order"] else "IMPROVED"
        ),
        SimulationImpactMetric(
            label="Procurement Spend Required",
            before=f"₹{before_state['estimated_cost']:,.0f}",
            after=f"₹{after_state['estimated_cost']:,.0f}",
            difference=f"₹{round(after_state['estimated_cost'] - before_state['estimated_cost']):+,.0f}",
            status="DEGRADED" if after_state["estimated_cost"] > before_state["estimated_cost"] else "NEUTRAL"
        ),
        SimulationImpactMetric(
            label="Emergency Reserve Coverage",
            before=f"{round((actual_current_stock / max(1, baseline_reserve)) * 100)}%",
            after=f"{round((sim_stock / max(1, sim_reserve)) * 100)}%",
            difference=f"{round(((sim_stock / max(1, sim_reserve)) - (actual_current_stock / max(1, baseline_reserve))) * 100):+}%",
            status="DEGRADED" if (sim_stock / max(1, sim_reserve)) < 1.0 else "IMPROVED"
        )
    ]

    # Key drivers & explanation
    drivers = []
    if sim_lead > baseline_lead:
        drivers.append(f"Supplier lead time widened from {baseline_lead} to {sim_lead} days (+{sim_lead - baseline_lead} days).")
    if effective_sim_daily > baseline_daily:
        drivers.append(f"Consumption rate increased from {baseline_daily:.1f} to {effective_sim_daily:.1f}/day ({req.unexpected_demand_surge_percent:+.0f}% surge).")
    if sim_stock < actual_current_stock:
        drivers.append(f"Available stock decreased by {actual_current_stock - sim_stock} units.")
    if sim_reserve > baseline_reserve:
        drivers.append(f"Emergency reserve target raised from {baseline_reserve} to {sim_reserve} units.")

    if not drivers:
        drivers.append("Simulation parameters match current operational baseline.")

    critical_warning = None
    if after_state["days_remaining"] < sim_lead:
        critical_warning = f"CRITICAL STOCKOUT HAZARD: Remaining stock ({after_state['days_remaining']} days) is insufficient to bridge supplier fulfillment lead time ({sim_lead} days)!"
    elif after_state["reserve_risk"] == "CRITICAL":
        critical_warning = f"EMERGENCY RESERVE BREACH: Projected stock falls below statutory hospital reserve ({sim_reserve} units)."

    # Natural language explainable AI summary
    explanation = (
        f"Supplier delay combined with {'accelerated ward demand' if effective_sim_daily > baseline_daily else 'consumption pressure'} "
        f"compresses stock coverage down to {after_state['days_remaining']} days. "
        f"Under these parameters, an immediate replenishment purchase order of {after_state['recommended_order']} {med.unit} "
        f"(estimated spend ₹{after_state['estimated_cost']:,.0f}) is required to avoid stockout before delivery."
    )

    action_plan = [
        f"1. Create Purchase Order for {after_state['recommended_order']} {med.unit} of {med.name} immediately.",
        f"2. Confirm priority courier dispatch with {med.supplier.name if med.supplier else 'vendor'} to cap lead time at {sim_lead} days.",
        f"3. Institute ward-level rationing if inventory dips below {sim_reserve} units."
    ]

    return SimulationResult(
        medicine_id=med.id,
        medicine_name=med.name,
        before_state=before_state,
        after_state=after_state,
        impact_metrics=impact_metrics,
        explanation=explanation,
        key_drivers=drivers,
        critical_warning=critical_warning,
        action_plan=action_plan
    )

@router.post("/tick")
def live_simulation_tick(db: Session = Depends(get_db)):
    """
    Live simulation tick: simulates real-time consumption pulses across medicines,
    updates stock, and returns system analysis events for live animated demonstration!
    """
    meds = db.query(Medicine).all()
    if not meds:
        return {"status": "no_data"}

    # Pick 2-3 random medicines to simulate live ward consumption
    sampled = random.sample(meds, min(3, len(meds)))
    updates = []

    for med in sampled:
        # Subtract random usage (1 to 4 units)
        batch = db.query(InventoryBatch).filter(InventoryBatch.medicine_id == med.id, InventoryBatch.quantity > 0).first()
        used = random.randint(1, 3)
        if batch and batch.quantity >= used:
            batch.quantity -= used
            db.commit()

            # Record in consumption history for today
            today = date.today()
            ch = db.query(ConsumptionHistory).filter(ConsumptionHistory.medicine_id == med.id, ConsumptionHistory.date == today).first()
            if ch:
                ch.quantity_used += used
            else:
                db.add(ConsumptionHistory(
                    medicine_id=med.id,
                    date=today,
                    quantity_used=used,
                    department="Live ICU Simulation",
                    is_abnormal=False
                ))
            db.commit()

            updates.append({
                "medicine_id": med.id,
                "medicine_name": med.name,
                "units_consumed": used,
                "remaining_batch_stock": batch.quantity
            })

    return {
        "status": "success",
        "system_status": "ANALYZING_INVENTORY",
        "timestamp": date.today().isoformat(),
        "live_consumption_events": updates,
        "message": f"Real-time sensor pulse logged for {len(updates)} medications. ML engines re-indexing."
    }
