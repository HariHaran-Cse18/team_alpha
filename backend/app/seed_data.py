import random
import math
from datetime import datetime, date, timedelta
from app.auth_utils import hash_password
from app.database import SessionLocal, engine, Base
from app.models import Medicine, Supplier, InventoryBatch, ConsumptionHistory, PurchaseOrder, Alert, User

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for clean idempotent seed
    db.query(Alert).delete()
    db.query(PurchaseOrder).delete()
    db.query(ConsumptionHistory).delete()
    db.query(InventoryBatch).delete()
    db.query(Medicine).delete()
    db.query(Supplier).delete()
    db.query(User).delete()
    db.commit()

    print("Seeding Users...")
    admin_user = User(
        email="admin@medora.ai",
        hashed_password=hash_password("admin123"),
        full_name="Dr. Alistair Vance",
        role="Chief Supply Chain Officer",
        hospital_name="Apollo Metropolitan Academic Hospital"
    )
    db.add(admin_user)
    db.commit()

    print("Seeding Suppliers...")
    suppliers_data = [
        {"name": "MedSupply Corp", "contact_person": "Vikram Sethi", "email": "orders@medsupply.com", "phone": "+91-98765-43210", "lead_time": 5, "reliability": 94.0, "rating": 4.8},
        {"name": "HealthLine Logistics", "contact_person": "Anita Desai", "email": "supply@healthline.in", "phone": "+91-98234-56781", "lead_time": 8, "reliability": 82.0, "rating": 3.9},
        {"name": "Apex BioPharma", "contact_person": "Ramesh Nair", "email": "sales@apexbio.com", "phone": "+91-98111-22334", "lead_time": 4, "reliability": 97.5, "rating": 4.9},
        {"name": "Bharat Meditech", "contact_person": "Pooja Hegde", "email": "contact@bharatmed.in", "phone": "+91-97444-55667", "lead_time": 6, "reliability": 91.0, "rating": 4.5},
        {"name": "NovaCare Pharma", "contact_person": "Sanjay Kapoor", "email": "dispatch@novacare.com", "phone": "+91-98333-11224", "lead_time": 7, "reliability": 88.5, "rating": 4.2},
        {"name": "Global Life Sciences", "contact_person": "Elena Rostova", "email": "apac@globallife.org", "phone": "+91-99887-76655", "lead_time": 10, "reliability": 85.0, "rating": 4.0},
        {"name": "ZenMed Surgicals", "contact_person": "Arun Prasad", "email": "info@zenmed.com", "phone": "+91-97222-33445", "lead_time": 3, "reliability": 96.0, "rating": 4.7},
        {"name": "MedPulse Systems", "contact_person": "Divya Sharma", "email": "ops@medpulse.io", "phone": "+91-96555-44332", "lead_time": 5, "reliability": 93.0, "rating": 4.4},
        {"name": "CareFirst Supplies", "contact_person": "Kiran Roy", "email": "support@carefirst.net", "phone": "+91-95444-33221", "lead_time": 9, "reliability": 80.5, "rating": 3.7},
        {"name": "Reliance Medicals", "contact_person": "Meera Joshi", "email": "b2b@reliancemed.com", "phone": "+91-98999-88776", "lead_time": 4, "reliability": 95.0, "rating": 4.6},
    ]

    suppliers = []
    for s in suppliers_data:
        supplier_obj = Supplier(
            name=s["name"],
            contact_person=s["contact_person"],
            email=s["email"],
            phone=s["phone"],
            average_lead_time=s["lead_time"],
            reliability_score=s["reliability"],
            rating=s["rating"],
            quality_compliance=round(s["reliability"] * 1.02, 1)
        )
        db.add(supplier_obj)
        suppliers.append(supplier_obj)
    db.commit()

    # Re-fetch with IDs
    suppliers = db.query(Supplier).all()

    print("Seeding 32 Medicines...")
    # Seed 32 medicines spanning categories and criticalities
    medicines_meta = [
        # Critical Care / High Risk Demo Candidate
        {"name": "Insulin Glargine 100 IU/ml", "generic": "Insulin Glargine", "cat": "Critical Care", "form": "Injection", "unit": "Vials", "cost": 650.0, "crit": "CRITICAL", "min": 250, "safe": 150, "reserve": 100, "sup_idx": 0, "curr_stock": 120, "base_usage": 40},
        {"name": "Meropenem 1g Inj", "generic": "Meropenem", "cat": "Antibiotics", "form": "Injection", "unit": "Vials", "cost": 890.0, "crit": "CRITICAL", "min": 200, "safe": 120, "reserve": 80, "sup_idx": 2, "curr_stock": 80, "base_usage": 25},
        {"name": "Propofol 1% 20ml", "generic": "Propofol", "cat": "Critical Care", "form": "Ampoules", "unit": "Ampoules", "cost": 420.0, "crit": "CRITICAL", "min": 300, "safe": 200, "reserve": 120, "sup_idx": 3, "curr_stock": 280, "base_usage": 35},
        {"name": "Heparin Sodium 5000 IU/ml", "generic": "Heparin Sodium", "cat": "Critical Care", "form": "Vials", "unit": "Vials", "cost": 210.0, "crit": "CRITICAL", "min": 350, "safe": 220, "reserve": 150, "sup_idx": 0, "curr_stock": 180, "base_usage": 45},
        {"name": "Epinephrine 1mg/ml", "generic": "Epinephrine", "cat": "Emergency", "form": "Ampoules", "unit": "Ampoules", "cost": 115.0, "crit": "CRITICAL", "min": 180, "safe": 120, "reserve": 90, "sup_idx": 1, "curr_stock": 140, "base_usage": 15},
        {"name": "Atropine Sulfate 0.6mg/ml", "generic": "Atropine", "cat": "Emergency", "form": "Ampoules", "unit": "Ampoules", "cost": 45.0, "crit": "HIGH", "min": 200, "safe": 100, "reserve": 70, "sup_idx": 6, "curr_stock": 210, "base_usage": 18},
        {"name": "Norepinephrine 4mg/2ml", "generic": "Norepinephrine Bitartrate", "cat": "Critical Care", "form": "Ampoules", "unit": "Ampoules", "cost": 310.0, "crit": "CRITICAL", "min": 220, "safe": 140, "reserve": 100, "sup_idx": 2, "curr_stock": 95, "base_usage": 22},
        {"name": "Human Albumin 20% 100ml", "generic": "Albumin Human", "cat": "Critical Care", "form": "Infusion", "unit": "Bottles", "cost": 3450.0, "crit": "CRITICAL", "min": 80, "safe": 50, "reserve": 35, "sup_idx": 5, "curr_stock": 42, "base_usage": 8},

        # Antibiotics
        {"name": "Ceftriaxone 1g Inj", "generic": "Ceftriaxone Sodium", "cat": "Antibiotics", "form": "Injection", "unit": "Vials", "cost": 145.0, "crit": "HIGH", "min": 450, "safe": 300, "reserve": 180, "sup_idx": 3, "curr_stock": 390, "base_usage": 55},
        {"name": "Amoxicillin-Clavulanate 625mg", "generic": "Amoxicillin + Clavulanic Acid", "cat": "Antibiotics", "form": "Tablets", "unit": "Strip of 10", "cost": 180.0, "crit": "MEDIUM", "min": 500, "safe": 300, "reserve": 150, "sup_idx": 4, "curr_stock": 480, "base_usage": 60},
        {"name": "Vancomycin 500mg Inj", "generic": "Vancomycin Hydrochloride", "cat": "Antibiotics", "form": "Injection", "unit": "Vials", "cost": 520.0, "crit": "HIGH", "min": 160, "safe": 100, "reserve": 60, "sup_idx": 7, "curr_stock": 110, "base_usage": 18},
        {"name": "Azithromycin 500mg", "generic": "Azithromycin", "cat": "Antibiotics", "form": "Tablets", "unit": "Strip of 5", "cost": 95.0, "crit": "MEDIUM", "min": 350, "safe": 200, "reserve": 100, "sup_idx": 8, "curr_stock": 310, "base_usage": 35},
        {"name": "Remdesivir 100mg Inj", "generic": "Remdesivir", "cat": "Antibiotics", "form": "Injection", "unit": "Vials", "cost": 2100.0, "crit": "HIGH", "min": 120, "safe": 70, "reserve": 50, "sup_idx": 5, "curr_stock": 65, "base_usage": 14},

        # Analgesics & Anesthesia
        {"name": "Paracetamol 500mg Tabs", "generic": "Paracetamol", "cat": "Analgesics", "form": "Tablets", "unit": "Strip of 15", "cost": 25.0, "crit": "MEDIUM", "min": 600, "safe": 350, "reserve": 200, "sup_idx": 9, "curr_stock": 500, "base_usage": 80},
        {"name": "Morphine Sulfate 10mg Inj", "generic": "Morphine", "cat": "Analgesics", "form": "Ampoules", "unit": "Ampoules", "cost": 95.0, "crit": "HIGH", "min": 150, "safe": 90, "reserve": 60, "sup_idx": 0, "curr_stock": 125, "base_usage": 16},
        {"name": "Fentanyl Citrate 50mcg/ml", "generic": "Fentanyl", "cat": "Analgesics", "form": "Ampoules", "unit": "Ampoules", "cost": 185.0, "crit": "CRITICAL", "min": 140, "safe": 90, "reserve": 60, "sup_idx": 2, "curr_stock": 78, "base_usage": 15},
        {"name": "Tramadol 50mg Inj", "generic": "Tramadol Hydrochloride", "cat": "Analgesics", "form": "Ampoules", "unit": "Ampoules", "cost": 42.0, "crit": "MEDIUM", "min": 250, "safe": 150, "reserve": 80, "sup_idx": 4, "curr_stock": 240, "base_usage": 28},

        # Fluids & Consumables
        {"name": "Normal Saline 0.9% 500ml", "generic": "Sodium Chloride 0.9%", "cat": "Fluids & Consumables", "form": "IV Infusion", "unit": "Bottles", "cost": 48.0, "crit": "HIGH", "min": 1200, "safe": 800, "reserve": 500, "sup_idx": 3, "curr_stock": 950, "base_usage": 130},
        {"name": "Ringer's Lactate 500ml", "generic": "Compound Sodium Lactate", "cat": "Fluids & Consumables", "form": "IV Infusion", "unit": "Bottles", "cost": 55.0, "crit": "HIGH", "min": 900, "safe": 600, "reserve": 350, "sup_idx": 3, "curr_stock": 720, "base_usage": 95},
        {"name": "Dextrose 5% 500ml", "generic": "Dextrose Monohydrate", "cat": "Fluids & Consumables", "form": "IV Infusion", "unit": "Bottles", "cost": 52.0, "crit": "MEDIUM", "min": 700, "safe": 450, "reserve": 250, "sup_idx": 9, "curr_stock": 610, "base_usage": 70},
        {"name": "Disposable Syringes 5ml", "generic": "Sterile Syringe with Needle", "cat": "Fluids & Consumables", "form": "Consumable", "unit": "Pack of 100", "cost": 320.0, "crit": "MEDIUM", "min": 1500, "safe": 900, "reserve": 500, "sup_idx": 6, "curr_stock": 900, "base_usage": 100},
        {"name": "IV Cannula 20G Pink", "generic": "Intravenous Cannula", "cat": "Fluids & Consumables", "form": "Consumable", "unit": "Pack of 50", "cost": 450.0, "crit": "HIGH", "min": 600, "safe": 400, "reserve": 250, "sup_idx": 6, "curr_stock": 480, "base_usage": 55},
        {"name": "N95 Surgical Respirator Masks", "generic": "Particulate Respirator", "cat": "Fluids & Consumables", "form": "Consumable", "unit": "Box of 20", "cost": 580.0, "crit": "MEDIUM", "min": 400, "safe": 250, "reserve": 150, "sup_idx": 7, "curr_stock": 360, "base_usage": 40},

        # Emergency & Cardiovascular
        {"name": "Dopamine 200mg/5ml Inj", "generic": "Dopamine Hydrochloride", "cat": "Emergency", "form": "Ampoules", "unit": "Ampoules", "cost": 165.0, "crit": "CRITICAL", "min": 150, "safe": 90, "reserve": 60, "sup_idx": 1, "curr_stock": 85, "base_usage": 14},
        {"name": "Hydrocortisone 100mg Inj", "generic": "Hydrocortisone Sodium Succinate", "cat": "Emergency", "form": "Vials", "unit": "Vials", "cost": 130.0, "crit": "HIGH", "min": 240, "safe": 150, "reserve": 100, "sup_idx": 4, "curr_stock": 210, "base_usage": 26},
        {"name": "Furosemide 20mg/2ml Inj", "generic": "Furosemide", "cat": "Emergency", "form": "Ampoules", "unit": "Ampoules", "cost": 28.0, "crit": "HIGH", "min": 350, "safe": 220, "reserve": 140, "sup_idx": 8, "curr_stock": 290, "base_usage": 38},
        {"name": "Potassium Chloride 15% Inj", "generic": "Potassium Chloride", "cat": "Critical Care", "form": "Ampoules", "unit": "Ampoules", "cost": 65.0, "crit": "HIGH", "min": 200, "safe": 120, "reserve": 80, "sup_idx": 0, "curr_stock": 160, "base_usage": 20},

        # Chronic Care & Respiratory
        {"name": "Metformin 500mg Tabs", "generic": "Metformin Hydrochloride", "cat": "Chronic Care", "form": "Tablets", "unit": "Strip of 20", "cost": 45.0, "crit": "LOW", "min": 800, "safe": 500, "reserve": 300, "sup_idx": 9, "curr_stock": 820, "base_usage": 90},
        {"name": "Salbutamol 100mcg Inhaler", "generic": "Salbutamol", "cat": "Chronic Care", "form": "Inhaler", "unit": "Canister", "cost": 230.0, "crit": "MEDIUM", "min": 180, "safe": 100, "reserve": 60, "sup_idx": 7, "curr_stock": 145, "base_usage": 15},
        {"name": "Ipratropium Respirator Soln", "generic": "Ipratropium Bromide", "cat": "Chronic Care", "form": "Nebulizer Solution", "unit": "Bottles", "cost": 195.0, "crit": "MEDIUM", "min": 150, "safe": 90, "reserve": 50, "sup_idx": 7, "curr_stock": 130, "base_usage": 12},
        {"name": "Pantoprazole 40mg Inj", "generic": "Pantoprazole Sodium", "cat": "Chronic Care", "form": "Vials", "unit": "Vials", "cost": 85.0, "crit": "MEDIUM", "min": 400, "safe": 250, "reserve": 160, "sup_idx": 8, "curr_stock": 380, "base_usage": 48},
        {"name": "Enoxaparin 40mg/0.4ml Syringe", "generic": "Enoxaparin Sodium", "cat": "Critical Care", "form": "Pre-filled Syringe", "unit": "Syringes", "cost": 480.0, "crit": "HIGH", "min": 220, "safe": 140, "reserve": 90, "sup_idx": 0, "curr_stock": 175, "base_usage": 22},
    ]

    medicines = []
    for idx, m in enumerate(medicines_meta):
        sup = suppliers[m["sup_idx"] % len(suppliers)]
        med_obj = Medicine(
            name=m["name"],
            generic_name=m["generic"],
            category=m["cat"],
            dosage_form=m["form"],
            unit=m["unit"],
            unit_cost=m["cost"],
            criticality=m["crit"],
            minimum_stock=m["min"],
            safety_stock=m["safe"],
            emergency_reserve=m["reserve"],
            supplier_id=sup.id,
            description=f"Clinical standard {m['name']} for hospital ward operations.",
            storage_conditions="Refrigerated 2-8°C" if "Insulin" in m["name"] or "Albumin" in m["name"] else "Controlled room temp 20-25°C"
        )
        db.add(med_obj)
        medicines.append(med_obj)
    db.commit()

    # Re-fetch medicines with IDs
    medicines = db.query(Medicine).all()

    print("Generating 90-Day Consumption History per Medicine...")
    today = date.today()

    for med_idx, med in enumerate(medicines):
        base = medicines_meta[med_idx]["base_usage"]
        is_insulin = "Insulin" in med.name
        is_meropenem = "Meropenem" in med.name
        is_remdesivir = "Remdesivir" in med.name

        for d in range(90, 0, -1):
            curr_date = today - timedelta(days=d)
            dow = curr_date.weekday() # 0-4 weekday, 5-6 weekend

            # Day of week factor: weekdays have higher hospital consumption
            dow_mult = 0.85 if dow in (5, 6) else 1.05

            # Trend factor
            if is_insulin:
                # Upward trend for insulin in last 14 days (+25%)
                trend_mult = 1.0 + (0.25 * (90 - d) / 90.0)
                if d <= 5: # recent spike
                    trend_mult *= 1.22
            elif is_remdesivir and (20 <= d <= 35):
                # Temporary outbreak spike in historical data
                trend_mult = 2.1
            else:
                trend_mult = 1.0 + random.uniform(-0.08, 0.08)

            noise = random.gauss(0, base * 0.12)
            daily_qty = max(2, int(round(base * dow_mult * trend_mult + noise)))

            is_abnormal = False
            z_score = 0.0
            if is_remdesivir and (20 <= d <= 35):
                is_abnormal = True
                z_score = 2.8
            elif is_insulin and d <= 5:
                is_abnormal = True
                z_score = 2.4

            hist_record = ConsumptionHistory(
                medicine_id=med.id,
                date=curr_date,
                quantity_used=daily_qty,
                department="Emergency / ICU / General Wards",
                is_abnormal=is_abnormal,
                z_score=round(z_score, 2)
            )
            db.add(hist_record)

    db.commit()

    print("Seeding Inventory Batches & Expiry Dates...")
    # Seed multiple batches for each medicine with varied expiry horizons
    # Specifically include batches expiring in <= 7 days, <= 30 days, <= 90 days, > 180 days
    for med_idx, med in enumerate(medicines):
        curr_target = medicines_meta[med_idx]["curr_stock"]
        is_antibiotic = "Meropenem" in med.name or "Ceftriaxone" in med.name
        is_insulin = "Insulin" in med.name

        if is_insulin:
            # Batch 1: Expiring in 60 days
            b1 = InventoryBatch(
                medicine_id=med.id,
                batch_number=f"IN-GL-{random.randint(1000, 9999)}",
                quantity=curr_target,
                received_date=today - timedelta(days=20),
                expiry_date=today + timedelta(days=60),
                unit_purchase_cost=med.unit_cost,
                location="Refrigerated Vault R-2"
            )
            db.add(b1)
        elif is_antibiotic:
            # Batch 1: Expiring in 15 days (WARNING/EXPIRING SOON)
            exp_15 = min(30, curr_target // 3)
            b1 = InventoryBatch(
                medicine_id=med.id,
                batch_number=f"AB-EXP-{random.randint(1000, 9999)}",
                quantity=exp_15,
                received_date=today - timedelta(days=90),
                expiry_date=today + timedelta(days=15),
                unit_purchase_cost=med.unit_cost,
                location="Pharmacy Shelf B-3"
            )
            # Batch 2: Expiring in 180 days
            b2 = InventoryBatch(
                medicine_id=med.id,
                batch_number=f"AB-MAIN-{random.randint(1000, 9999)}",
                quantity=curr_target - exp_15,
                received_date=today - timedelta(days=10),
                expiry_date=today + timedelta(days=180),
                unit_purchase_cost=med.unit_cost,
                location="Main Warehouse Section A"
            )
            db.add(b1)
            db.add(b2)
        elif med_idx == 4: # Epinephrine - near expiry case (5 days)
            exp_5 = 25
            b1 = InventoryBatch(
                medicine_id=med.id,
                batch_number=f"EP-URG-{random.randint(1000, 9999)}",
                quantity=exp_5,
                received_date=today - timedelta(days=120),
                expiry_date=today + timedelta(days=5),
                unit_purchase_cost=med.unit_cost,
                location="Crash Cart Reserve C"
            )
            b2 = InventoryBatch(
                medicine_id=med.id,
                batch_number=f"EP-NORM-{random.randint(1000, 9999)}",
                quantity=curr_target - exp_5,
                received_date=today - timedelta(days=30),
                expiry_date=today + timedelta(days=150),
                unit_purchase_cost=med.unit_cost,
                location="Pharmacy Shelf A-1"
            )
            db.add(b1)
            db.add(b2)
        else:
            # Standard multi-batch distribution
            qty_b1 = int(curr_target * 0.6)
            qty_b2 = curr_target - qty_b1
            days_exp1 = random.choice([25, 45, 80, 120, 240, 365])
            days_exp2 = days_exp1 + random.randint(90, 200)

            b1 = InventoryBatch(
                medicine_id=med.id,
                batch_number=f"BAT-{med.category[:2].upper()}-{random.randint(1000, 9999)}",
                quantity=qty_b1,
                received_date=today - timedelta(days=random.randint(15, 60)),
                expiry_date=today + timedelta(days=days_exp1),
                unit_purchase_cost=med.unit_cost,
                location=f"Pharmacy Shelf {chr(65 + med_idx % 6)}-{med_idx % 5 + 1}"
            )
            b2 = InventoryBatch(
                medicine_id=med.id,
                batch_number=f"BAT-{med.category[:2].upper()}-{random.randint(1000, 9999)}",
                quantity=qty_b2,
                received_date=today - timedelta(days=5),
                expiry_date=today + timedelta(days=days_exp2),
                unit_purchase_cost=med.unit_cost,
                location="Warehouse Block C"
            )
            db.add(b1)
            db.add(b2)

    db.commit()

    print("Seeding Initial Purchase Orders...")
    po_samples = [
        {"med_idx": 1, "sup_idx": 2, "qty": 200, "status": "IN_TRANSIT", "days_to_deliv": 2, "prio": "HIGH"},
        {"med_idx": 6, "sup_idx": 2, "qty": 150, "status": "PENDING", "days_to_deliv": 4, "prio": "URGENT"},
        {"med_idx": 7, "sup_idx": 5, "qty": 50, "status": "IN_TRANSIT", "days_to_deliv": 3, "prio": "HIGH"},
        {"med_idx": 17, "sup_idx": 3, "qty": 800, "status": "IN_TRANSIT", "days_to_deliv": 1, "prio": "NORMAL"},
        {"med_idx": 20, "sup_idx": 6, "qty": 1000, "status": "PENDING", "days_to_deliv": 3, "prio": "NORMAL"},
        {"med_idx": 23, "sup_idx": 1, "qty": 100, "status": "IN_TRANSIT", "days_to_deliv": 2, "prio": "HIGH"},
        {"med_idx": 3, "sup_idx": 0, "qty": 200, "status": "PENDING", "days_to_deliv": 5, "prio": "URGENT"},
        {"med_idx": 12, "sup_idx": 5, "qty": 80, "status": "DELIVERED", "days_to_deliv": -2, "prio": "HIGH"},
    ]

    for idx, po in enumerate(po_samples):
        med = medicines[po["med_idx"]]
        sup = suppliers[po["sup_idx"]]
        order_d = today - timedelta(days=abs(po["days_to_deliv"]) + 2)
        exp_d = today + timedelta(days=po["days_to_deliv"])

        po_obj = PurchaseOrder(
            po_number=f"PO-2026-{1000 + idx}",
            medicine_id=med.id,
            supplier_id=sup.id,
            quantity=po["qty"],
            unit_price=med.unit_cost,
            total_amount=round(po["qty"] * med.unit_cost, 2),
            status=po["status"],
            priority=po["prio"],
            order_date=order_d,
            expected_delivery_date=exp_d,
            notes=f"Automated procurement batch for {med.name}."
        )
        db.add(po_obj)

    db.commit()

    print("Seeding Initial Intelligent Alerts...")
    initial_alerts = [
        {
            "severity": "CRITICAL",
            "title": "Insulin Glargine Stockout Imminent",
            "message": "Insulin inventory may fall below emergency reserve within 4 days. Consumption increased 18% with 5-day supplier lead time.",
            "med_name": "Insulin Glargine 100 IU/ml",
            "action": "PROCURE"
        },
        {
            "severity": "WARNING",
            "title": "Abnormal Surge: Meropenem Usage +24%",
            "message": "ICU consumption increased from 20 to 25 units/day over the last 72 hours.",
            "med_name": "Meropenem 1g Inj",
            "action": "MONITOR"
        },
        {
            "severity": "EXPIRY",
            "title": "Batch EP-URG Expiring in 5 Days",
            "message": "25 ampoules of Epinephrine in Crash Cart Reserve C expire within 5 days (Value at risk: ₹2,875).",
            "med_name": "Epinephrine 1mg/ml",
            "action": "TRANSFER"
        },
        {
            "severity": "WARNING",
            "title": "Norepinephrine Approaching Reserve",
            "message": "Current balance (95 units) is dangerously close to Emergency Reserve (100 units).",
            "med_name": "Norepinephrine 4mg/2ml",
            "action": "PROCURE"
        },
        {
            "severity": "INFO",
            "title": "Supplier Delivery Scheduled Tomorrow",
            "message": "Normal Saline (PO-2026-1003, 800 bottles) in-transit from Apex BioPharma, on schedule.",
            "med_name": "Normal Saline 0.9% 500ml",
            "action": "MONITOR"
        }
    ]

    for alt in initial_alerts:
        med = db.query(Medicine).filter(Medicine.name == alt["med_name"]).first()
        alert_obj = Alert(
            severity=alt["severity"],
            title=alt["title"],
            message=alt["message"],
            medicine_id=med.id if med else None,
            action_type=alt["action"],
            is_read=False,
            is_resolved=False
        )
        db.add(alert_obj)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
