import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  ShoppingCart,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import CreateOrderModal from '../components/CreateOrderModal';
import { api } from '../services/api';

export default function SimulatorPage({ setActivePage }) {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState(1);
  const [dailyDemand, setDailyDemand] = useState(40);
  const [leadTime, setLeadTime] = useState(5);
  const [currentStock, setCurrentStock] = useState(120);
  const [emergencyReserve, setEmergencyReserve] = useState(100);
  const [demandSurge, setDemandSurge] = useState(0);
  const [expiryHorizon, setExpiryHorizon] = useState(60);

  const [isCalculating, setIsCalculating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [orderModalData, setOrderModalData] = useState(null);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const list = await api.getInventory();
        setMedicines(list);
        if (list.length > 0) {
          const insulin = list.find(m => m.name.toLowerCase().includes('insulin')) || list[0];
          setSelectedMedId(insulin.id);
          setDailyDemand(insulin.daily_usage || 40);
          setLeadTime(insulin.supplier_lead_time || 5);
          setCurrentStock(insulin.current_stock || 120);
          setEmergencyReserve(insulin.emergency_reserve || 100);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeds();
  }, []);

  const handleMedicineChange = (id) => {
    setSelectedMedId(id);
    const med = medicines.find(m => m.id === id);
    if (med) {
      setDailyDemand(med.daily_usage || 40);
      setLeadTime(med.supplier_lead_time || 5);
      setCurrentStock(med.current_stock || 120);
      setEmergencyReserve(med.emergency_reserve || 100);
      setDemandSurge(0);
      setSimulationResult(null);
    }
  };

  // Preset for the Hackathon Demonstration
  const loadHackathonDemoPreset = () => {
    const insulin = medicines.find(m => m.name.toLowerCase().includes('insulin')) || medicines[0];
    if (insulin) {
      setSelectedMedId(insulin.id);
      setDailyDemand(70); // 40 -> 70
      setLeadTime(10);    // 5 -> 10 days
      setCurrentStock(120);
      setEmergencyReserve(150); // 100 -> 150
      setDemandSurge(30); // +30% surge
    }
  };

  const handleRunSimulation = async () => {
    setIsCalculating(true);
    try {
      const payload = {
        medicine_id: selectedMedId,
        daily_demand: Number(dailyDemand),
        supplier_lead_time: Number(leadTime),
        current_stock: Number(currentStock),
        emergency_reserve: Number(emergencyReserve),
        unexpected_demand_surge_percent: Number(demandSurge),
        expiry_horizon_days: Number(expiryHorizon)
      };

      // Synthetic 600ms delay for impressive animated calculation UX
      await new Promise(r => setTimeout(r, 600));
      const res = await api.runWhatIf(payload);
      setSimulationResult(res);
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const selectedMed = medicines.find(m => m.id === selectedMedId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <FlaskConical className="w-6 h-6 text-amber-400" />
              <span>Supply Chain What-If Simulator</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Interactive Hackathon Showcase
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate dynamic hospital stress tests: adjust ward demand surge, supplier lead times, and reserve thresholds in real-time
          </p>
        </div>

        {/* Hackathon Preset Button */}
        <button
          onClick={loadHackathonDemoPreset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold shadow-glow-amber transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Load Hackathon Surge Demo (Insulin 40 → 70/day)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Sliders & Controls */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Scenario Control Sliders</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">Dynamic Input</span>
          </div>

          {/* Select Medicine */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Select Medication
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => handleMedicineChange(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.category})
                </option>
              ))}
            </select>
          </div>

          {/* Slider: Daily Demand */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-300">Daily Demand (Consumption)</span>
              <span className="font-mono font-bold text-cyan-300">{dailyDemand} units/day</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={dailyDemand}
              onChange={(e) => setDailyDemand(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>5 units</span>
              <span>100 units</span>
              <span>200 units</span>
            </div>
          </div>

          {/* Slider: Supplier Lead Time */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-300">Supplier Lead Time (Fulfillment)</span>
              <span className="font-mono font-bold text-amber-300">{leadTime} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 day</span>
              <span>12 days</span>
              <span>25 days</span>
            </div>
          </div>

          {/* Slider: Unexpected Demand Surge % */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-300">Unexpected Demand Surge</span>
              <span className="font-mono font-bold text-red-400">+{demandSurge}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={demandSurge}
              onChange={(e) => setDemandSurge(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0% (Standard)</span>
              <span>+50% (Spike)</span>
              <span>+100% (Epidemic)</span>
            </div>
          </div>

          {/* Slider: Current Stock */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-300">Current Stock Balance</span>
              <span className="font-mono font-bold text-white">{currentStock} units</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="20"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-300"
            />
          </div>

          {/* Slider: Emergency Reserve */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-300">Target Emergency Reserve</span>
              <span className="font-mono font-bold text-purple-300">{emergencyReserve} units</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={emergencyReserve}
              onChange={(e) => setEmergencyReserve(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Run Simulation Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isCalculating}
            className="w-full py-3.5 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 hover:from-amber-300 hover:to-orange-300 shadow-glow-amber transition-all flex items-center justify-center gap-2 transform active:scale-98"
          >
            {isCalculating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Simulating Multi-Echelon Telemetry...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>RUN WHAT-IF SIMULATION</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Side-by-Side Impact & AI Explanation */}
        <div className="lg:col-span-7 space-y-6">
          {simulationResult ? (
            <>
              {/* Critical Warning if breached */}
              {simulationResult.critical_warning && (
                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 shadow-glow-red flex items-start gap-3 animate-in fade-in">
                  <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-red-400">
                      🚨 SIMULATED RISK COLLAPSE DETECTED
                    </span>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {simulationResult.critical_warning}
                    </p>
                  </div>
                </div>
              )}

              {/* BEFORE vs AFTER Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BEFORE Card */}
                <div className="p-5 rounded-2xl glass-card border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      BASELINE (BEFORE)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                      Hospital Normal
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <span className="text-[11px] text-slate-400">Stockout Risk Level:</span>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        {simulationResult.before_state.stockout_risk}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Days of Remaining Stock:</span>
                      <div className="text-xl font-mono font-extrabold text-white">
                        {simulationResult.before_state.days_remaining} days
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Recommended Order:</span>
                      <div className="text-lg font-mono font-bold text-slate-300">
                        {simulationResult.before_state.recommended_order} units
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Daily Demand / Lead Time:</span>
                      <div className="text-xs font-mono text-slate-300">
                        {simulationResult.before_state.daily_demand}/day • {simulationResult.before_state.supplier_lead_time}d lead
                      </div>
                    </div>
                  </div>
                </div>

                {/* AFTER Card */}
                <div className="p-5 rounded-2xl glass-panel border border-red-500/40 shadow-glow-red relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                      SIMULATED IMPACT (AFTER)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                      {simulationResult.after_state.stockout_risk}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <span className="text-[11px] text-slate-400">Stockout Risk Level:</span>
                      <div className="text-base font-black text-red-400 mt-0.5">
                        {simulationResult.after_state.stockout_risk} RISK
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Days of Remaining Stock:</span>
                      <div className="text-2xl font-mono font-black text-red-400">
                        {simulationResult.after_state.days_remaining} days
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Recommended Order Quantity:</span>
                      <div className="text-2xl font-mono font-black text-cyan-300">
                        {simulationResult.after_state.recommended_order} units
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Daily Demand / Lead Time:</span>
                      <div className="text-xs font-mono text-amber-300 font-bold">
                        {simulationResult.after_state.daily_demand}/day • {simulationResult.after_state.supplier_lead_time}d lead
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Impact Delta Table */}
              <div className="p-5 rounded-2xl glass-panel border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Stress-Test Variance Matrix
                </h4>
                <div className="space-y-2">
                  {simulationResult.impact_metrics.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{m.label}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-400">{m.before}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                        <span className="font-bold text-white">{m.after}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          m.status === 'DEGRADED' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {m.difference}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainable AI Narrative */}
              <div className="p-5 rounded-2xl glass-card border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Why Did MEDORA Recommend This Action?
                  </h4>
                </div>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  "{simulationResult.explanation}"
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    Replenishment Spend: ₹{simulationResult.after_state.estimated_cost.toLocaleString()}
                  </span>

                  <button
                    onClick={() => setOrderModalData({
                      medicine_id: selectedMed.id,
                      medicine_name: selectedMed.name,
                      recommended_quantity: simulationResult.after_state.recommended_order,
                      unit: selectedMed.unit,
                      unit_cost: selectedMed.unit_cost,
                      priority: "URGENT",
                      lead_time_days: Number(leadTime),
                      supplier_id: selectedMed.supplier_id,
                      supplier_name: selectedMed.supplier_name
                    })}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Create Purchase Order</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-16 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center text-center">
              <FlaskConical className="w-12 h-12 text-slate-600 mb-3 animate-pulse-slow" />
              <h3 className="text-base font-bold text-slate-300">Ready to Simulate</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Modify the sliders on the left or click "Load Hackathon Surge Demo" and press [RUN WHAT-IF SIMULATION] to execute the stress-test.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={Boolean(orderModalData)}
        onClose={() => setOrderModalData(null)}
        recommendation={orderModalData}
        onSuccess={() => setActivePage('procurement')}
      />
    </div>
  );
}
