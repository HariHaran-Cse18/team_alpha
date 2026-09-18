# MEDORA AI — Healthcare Supply Chain Intelligence

> **"Predict. Prevent. Procure."**  
> *Intelligent hospital inventory & procurement clinical decision-support command center.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.141-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS_3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn_1.9-F7931E?logo=scikitlearn)](https://scikit-learn.org)
[![Offline Ready](https://img.shields.io/badge/Offline-100%25_Local-brightgreen)](#)

---

## Important Clinical Disclaimer
> **MEDORA AI is a clinical supply-chain and procurement decision-support platform.**  
> It does **NOT** provide medical diagnosis, clinical treatment plans, or replace healthcare professionals.

---

## Problem Statement Addressed
**HE-03: Healthcare Supply Chain Intelligence**  
Hospitals need reliable, uninterrupted access to critical medications, consumables, and emergency life-support supplies. Stockouts endanger patients, while excessive inventory leads to clinical waste from drug expiry. 

**MEDORA AI** resolves this challenge by continuously analyzing:
1. Current batch inventory & warehouse locations
2. 90-day historical consumption velocity
3. Predicted future patient demand via multi-step ML regression
4. Supplier lead times & historical fulfillment reliability
5. Batch expiration horizons (FEFO scheduling)
6. Medication criticality (CRITICAL, HIGH, MEDIUM, LOW)
7. Abnormal ward consumption surges (Z-score anomaly detector)
8. Mandatory emergency reserve compliance
9. Incoming purchase orders in pipeline
10. Recommended order quantities with transparent mathematical justifications

---

## Key Features

### 1. Futuristic Healthcare Command Center
- **Energy-Style Inventory Health Visual**: Concentric animated radial gauge displaying Resilience Health (82%), Stock Coverage (76%), and Emergency Reserve Compliance (91%).
- **6 Dynamic KPI Counters**: Total Items, Low Stock, Stockout Risks, Expiring Soon, In-Transit POs, and Capital Waste at Risk in ₹ INR.
- **MEDORA Intelligence Priority Banner**: Highlighted high-priority clinical warnings with one-click purchase order dispatch.
- **Live Simulation Mode**: Periodic background simulation of ward consumption with real-time recalculation of inventory metrics.

### 2. Machine Learning Demand Forecasting
- Multi-step time-series forecasting powered by `RandomForestRegressor` with feature engineering:
  - 7-day and 14-day rolling averages
  - Day-of-week and day-of-month clinical seasonality
  - Lag-1 and Lag-7 momentum indicators
- 95% confidence interval uncertainty envelopes
- Dynamic trend classification (`Increasing`, `Decreasing`, `Stable`) with natural language explanations.

### 3. Multi-Factor Risk Intelligence Matrix
- 5-dimensional risk scoring:
  - **Stockout Hazard**: Evaluates days of stock against supplier lead times.
  - **Expiry Horizon**: Categorizes batches expiring in ≤7 days (Critical), ≤30 days (Warning), or ≤90 days.
  - **Abnormal Consumption**: Rolling Z-score and median absolute deviation detecting surges.
  - **Supplier Delay**: Vendor reliability and logistics transit volatility.
  - **Emergency Reserve Breach**: Immediate alerts before inventory drops below statutory minimums.
- Interactive **"Why is this item risky?"** explainability drawer.

### 4. Smart Procurement Decision Engine
- Deterministic procurement formula:
  $$\text{Recommended Order} = \max\left(0, \lceil \text{Forecast Demand}_{\text{lead} + \text{review}} + \text{Safety Reserve} + \text{Emergency Reserve} - \text{Current Stock} - \text{Incoming Stock} \rceil\right)$$
- One-click **[Create Purchase Order]** with automated vendor assignment and expected delivery calculation.
- Lifecycle tracking: `PENDING` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `DELIVERED` (auto-ingests into inventory batches).

### 5. Supply Chain What-If Simulator (Major Hackathon Feature)
- Interactive stress-testing sliders for **Daily Demand**, **Supplier Lead Time**, **Current Stock**, **Emergency Reserve**, and **Demand Surge % (0-100%)**.
- Side-by-side **BEFORE vs. AFTER** impact comparison cards.
- Pre-configured 1-click **Hackathon Demo Preset** (Insulin Glargine surge from 40 $\rightarrow$ 70 units/day).

### 6. Supply Chain Digital Twin
- Interactive topology graph mapping physical supply flow:
  $$\text{Hospital Wards} \longrightarrow \text{Central Pharmacy} \longrightarrow \text{AI Decision Engine} \longrightarrow \text{Contracted Suppliers} \longrightarrow \text{In-Transit Logistics}$$

### 7. Clinical Expiry Surveillance & Timeline
- Visual temporal ribbon separating batches into $\le 7$ Days (Critical), $\le 30$ Days (Warning), and $\le 90$ Days.
- Capital Value-at-Risk calculations in ₹ INR and clinical reallocation dispatch workflows.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3.4, Recharts, Framer Motion, Lucide React |
| **Backend** | Python 3.13, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn |
| **Database** | SQLite (zero-setup local default) / PostgreSQL compatible |
| **AI / ML** | Scikit-Learn (RandomForestRegressor), Pandas, NumPy |
| **Auth & Security** | JWT (python-jose), bcrypt password hashing, CORS protection |

---

## Project Structure

```
medora-ai/
├── backend/
│   ├── app/
│   │   ├── intelligence/
│   │   │   ├── forecaster.py         # RandomForest time-series ML forecaster
│   │   │   ├── anomaly.py            # Z-score consumption anomaly detector
│   │   │   ├── risk_engine.py        # Multi-factor risk calculation engine
│   │   │   └── procurement_engine.py # Deterministic PO quantity calculator
│   │   ├── models/                   # SQLAlchemy database models
│   │   ├── schemas/                  # Pydantic validation schemas
│   │   ├── routes/                   # REST API endpoints
│   │   ├── config.py                 # Configuration & settings
│   │   ├── database.py               # Engine & sessionmaker
│   │   ├── auth_utils.py             # JWT & bcrypt security
│   │   ├── seed_data.py              # 32 medicines, 90-day history, suppliers
│   │   └── main.py                   # FastAPI application root
│   └── test_api.py                   # Automated verification test suite
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Sidebar, HealthRing, Modals, Cards
│   │   ├── pages/                    # 12 complete full-stack pages
│   │   ├── services/api.js           # REST API client
│   │   ├── context/AuthContext.jsx   # Authentication context & demo session
│   │   ├── App.jsx                   # Root application router
│   │   └── main.jsx                  # React DOM entry
│   ├── package.json
│   ├── vite.config.js                # Vite config with backend proxy
│   └── tailwind.config.js            # Futuristic healthcare theme
├── README.md
└── .env.example
```

---

## Getting Started

### Prerequisites
- Python 3.10+ (Python 3.13 tested)
- Node.js 18+ (Node.js 20 LTS included/tested)

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
# (or: pip install fastapi uvicorn sqlalchemy pydantic pandas scikit-learn python-jose bcrypt python-multipart httpx)

# Seed database with 32 realistic hospital medicines & 90 days consumption
python -m app.seed_data

# Run backend test suite
python test_api.py

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Backend will be live at `http://localhost:8000` (API docs at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## Step-by-Step Hackathon Demonstration Script

Follow this exact 12-step flow for judging presentations:

1. **Open Dashboard (`http://localhost:5173`)**:
   - Showcase the Command Center overview: 6 animated KPI cards, central Energy Health ring (82% Health, 76% Coverage, 91% Reserve).
   - Point out the **MEDORA INTELLIGENCE** banner highlighting high-priority interventions.
2. **Navigate to Inventory**:
   - Filter by `Critical Care`. Select **Insulin Glargine 100 IU/ml**.
   - Show stock (120 Vials), daily consumption (40/day), safety stock (150), emergency reserve (100).
3. **Navigate to Demand Forecast**:
   - Select **Insulin Glargine 100 IU/ml** with 14-day horizon.
   - Show historical consumption curve, ML predicted demand line, and 95% confidence bounds.
4. **Open What-If Simulator**:
   - Click the amber button **[Load Hackathon Surge Demo]**.
   - Note the simulated parameter changes: Daily demand surges from $40 \rightarrow 70$ units/day (+30% surge), supplier lead time widens to 10 days, emergency reserve target set to 150 units.
5. **Press [RUN WHAT-IF SIMULATION]**:
   - Watch the calculation animation.
6. **Analyze BEFORE vs. AFTER**:
   - BEFORE: Stockout Risk `LOW`, Coverage `8.0 days`, Recommended Order `300 units`.
   - AFTER: Stockout Risk escalates to `CRITICAL`, Coverage shrinks to `3.0 days` (insufficient to cover 10-day lead time!), Recommended Order jumps to `750 units`.
7. **Read the AI Explainability Narrative**:
   - *"Supplier delay combined with accelerated ward demand causes the projected stock level to fall below the emergency reserve within 3 days. Immediate replenishment purchase order of 750 units recommended."*
8. **Click [Create Purchase Order]**:
   - Review pre-filled modal: 750 units of Insulin, auto-allocated to MedSupply Corp (5-day lead time), total cost ₹487,500.
9. **Click [Confirm & Dispatch PO]**:
   - Confirm PO generation notification.
10. **Navigate to Procurement Center**:
    - Switch to **Active Purchase Orders** tab. See newly generated PO in `PENDING` status.
11. **Demonstrate Supply Chain Digital Twin**:
    - Click **Supply Chain Twin** in sidebar.
    - Click through nodes (Hospital Wards $\rightarrow$ Central Pharmacy $\rightarrow$ AI Engine $\rightarrow$ Suppliers $\rightarrow$ Logistics Fleet) to inspect real-time throughput.
12. **Return to Dashboard**:
    - Toggle **[Start Live Simulation]** in the top navigation bar.
    - Observe the glowing real-time telemetry banner updating stock levels dynamically as wards administer medication!

---

## Explainable AI: The "Why?" Engine
MEDORA AI adheres strictly to clinical transparency guidelines. **No recommendation is ever presented without its deterministic and statistical justification:**
- **Exact days of coverage** vs. vendor lead time
- **Emergency reserve breach margin** in units
- **Consumption surge percentage** against 30-day baseline
- **Formula transparency** displaying full mathematical breakdown:
  $$\text{Target} = \text{Forecast Demand} + \text{Safety Stock} + \text{Emergency Reserve}$$
  $$\text{Order} = \max(0, \text{Target} - \text{Available Stock} - \text{In-Transit POs})$$

---

## License
MIT License. Built for collegiate and healthcare hackathon innovation.
