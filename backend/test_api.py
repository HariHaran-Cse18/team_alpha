import sys
sys.stdout.reconfigure(encoding='utf-8')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing /api/health...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("[OK] Health check passed:", r.json()["system"])

    print("Testing /api/inventory...")
    r = client.get("/api/inventory")
    assert r.status_code == 200, f"Inventory failed: {r.text}"
    items = r.json()
    assert len(items) >= 30, f"Expected 30+ items, got {len(items)}"
    print(f"[OK] Inventory returned {len(items)} items. First: {items[0]['name']}")

    insulin_id = next(i["id"] for i in items if "Insulin" in i["name"])

    print(f"Testing /api/forecast/{insulin_id} (14 days)...")
    r = client.get(f"/api/forecast/{insulin_id}?horizon=14")
    assert r.status_code == 200, f"Forecast failed: {r.text}"
    fc = r.json()
    assert len(fc["forecast_points"]) == 14, "Expected 14 forecast points"
    print(f"[OK] Forecast for {fc['medicine_name']}: {fc['current_avg_daily']} -> {fc['predicted_avg_daily']}/day ({fc['demand_change_percent']:+.1f}%)")

    print("Testing /api/risks...")
    r = client.get("/api/risks")
    assert r.status_code == 200, f"Risks failed: {r.text}"
    risks = r.json()
    print(f"[OK] Risks analyzed: {risks['total_analyzed']} items, Critical: {risks['critical_count']}, High: {risks['high_count']}")

    print("Testing /api/procurement/recommendations...")
    r = client.get("/api/procurement/recommendations")
    assert r.status_code == 200, f"Procurement failed: {r.text}"
    recs = r.json()
    print(f"[OK] Procurement recommendations: {len(recs)} generated. Top: {recs[0]['medicine_name']} (Order: {recs[0]['recommended_quantity']} {recs[0]['unit']}, Priority: {recs[0]['priority']})")

    print("Testing /api/suppliers...")
    r = client.get("/api/suppliers")
    assert r.status_code == 200
    print(f"[OK] Suppliers: {len(r.json())} suppliers active.")

    print("Testing /api/expiry/timeline...")
    r = client.get("/api/expiry/timeline")
    assert r.status_code == 200
    exp = r.json()
    print(f"[OK] Expiry timeline: {exp['summary']['expiring_7_days_count']} in 7d, {exp['summary']['expiring_30_days_count']} in 30d, Total at risk: ₹{exp['summary']['total_value_at_risk']:,.0f}")

    print("Testing /api/simulation/what-if for Insulin (Surge +50%)...")
    sim_payload = {
        "medicine_id": insulin_id,
        "daily_demand": 70.0,
        "supplier_lead_time": 10,
        "current_stock": 120,
        "emergency_reserve": 150,
        "unexpected_demand_surge_percent": 30.0,
        "expiry_horizon_days": 60
    }
    r = client.post("/api/simulation/what-if", json=sim_payload)
    assert r.status_code == 200, f"Simulation failed: {r.text}"
    sim = r.json()
    print(f"[OK] What-If Simulator: Before ({sim['before_state']['stockout_risk']}, Order: {sim['before_state']['recommended_order']}) -> After ({sim['after_state']['stockout_risk']}, Order: {sim['after_state']['recommended_order']})")

    print("Testing /api/analytics/dashboard...")
    r = client.get("/api/analytics/dashboard")
    assert r.status_code == 200
    dash = r.json()
    print(f"[OK] Analytics Dashboard KPIs: Total Items: {dash['kpis']['total_items']}, Low Stock: {dash['kpis']['low_stock']}, Health: {dash['inventory_health']['health_score']}%")

    print("\nALL BACKEND API AND ML TESTS PASSED 100%!")

if __name__ == "__main__":
    test_endpoints()
