import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ShoppingCart,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import StatCard from '../components/StatCard';
import HealthRing from '../components/HealthRing';
import ExplainabilityModal from '../components/ExplainabilityModal';
import CreateOrderModal from '../components/CreateOrderModal';
import { api } from '../services/api';

export default function Dashboard({ setActivePage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [explainModalData, setExplainModalData] = useState(null);
  const [orderModalData, setOrderModalData] = useState(null);
  const [recentMeds, setRecentMeds] = useState([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [kpis, inventory] = await Promise.all([
        api.getDashboardKPIs(),
        api.getInventory()
      ]);
      setData(kpis);
      setRecentMeds(inventory.slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white uppercase tracking-wider">
            MEDORA AI is analyzing hospital inventory...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Running time-series regressions and multi-risk matrices
          </p>
        </div>
      </div>
    );
  }

  const k = data?.kpis || {};
  const health = data?.inventory_health || {};
  const topAi = data?.ai_top_recommendation || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Hospital Supply Chain Command Center
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Integrated decision-support dashboard monitoring critical care reserves and procurement pipelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Refresh Telemetry</span>
          </button>

          <button
            onClick={() => setActivePage('simulator')}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold shadow-glow-amber transition-all"
          >
            <span>What-If Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 Animated KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Items"
          value={k.total_items || 248}
          icon={Boxes}
          color="cyan"
          description="Tracked SKUs"
          trend="+4 this month"
        />
        <StatCard
          title="Low Stock"
          value={k.low_stock || 17}
          icon={AlertTriangle}
          color="amber"
          description="Below safety level"
          trend="Action required"
        />
        <StatCard
          title="Stockout Risks"
          value={k.stockout_risks || 6}
          icon={ShieldAlert}
          color="red"
          description="Lead time hazard"
          trend="Critical"
        />
        <StatCard
          title="Expiring Soon"
          value={k.expiring_soon || 12}
          icon={Clock}
          color="purple"
          description="Within 30 days"
          trend="FEFO priority"
        />
        <StatCard
          title="Pending Orders"
          value={k.pending_orders || 8}
          icon={ShoppingCart}
          color="green"
          description="In-transit POs"
          trend="On schedule"
        />
        <StatCard
          title="Estimated Waste"
          value={k.estimated_waste || 42500}
          prefix="₹"
          icon={TrendingDown}
          color="red"
          description="Value at risk"
          trend="Mitigable"
        />
      </div>

      {/* Energy-Style Central Inventory Health & AI Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Central Radial Gauge */}
        <div className="lg:col-span-6">
          <HealthRing
            healthScore={health.health_score || 82}
            stockCoverage={health.stock_coverage_score || 76}
            emergencyReserve={health.emergency_reserve_score || 91}
            healthyCount={health.healthy_count || 20}
            warningCount={health.warning_count || 7}
            criticalCount={health.critical_count || 5}
            expiredCount={health.expired_count || 2}
          />
        </div>

        {/* Prominent MEDORA Intelligence Panel */}
        <div className="lg:col-span-6 rounded-2xl glass-panel border border-cyan-500/30 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  MEDORA INTELLIGENCE — PRIORITY INTERVENTION
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                HIGH PRIORITY
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {topAi.title || "Insulin inventory may fall below emergency reserve within 4 days."}
              </h3>

              <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-400">Recommended Action:</span>
                <p className="text-sm font-extrabold text-cyan-300 mt-0.5">
                  {topAi.recommended_action || "Order 500 units within 24 hours."}
                </p>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Explainability Rationale:
                </span>
                {(topAi.reasons || [
                  "Consumption increased 18% over the last 72 hours",
                  "Supplier lead time: 5 days",
                  "Current stock approaching emergency reserve threshold",
                  "Demand forecast indicates increased ICU usage"
                ]).map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setExplainModalData({
                medicine_name: topAi.medicine_name || "Insulin Glargine 100 IU/ml",
                summary: "Insulin consumption surged due to increased ICU patient intake while supplier lead time requires 5 days for replenishment.",
                reasons: topAi.reasons
              })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Explainability</span>
            </button>

            <button
              onClick={() => setOrderModalData({
                medicine_id: topAi.medicine_id || 1,
                medicine_name: topAi.medicine_name || "Insulin Glargine 100 IU/ml",
                recommended_quantity: topAi.recommended_quantity || 500,
                unit: topAi.unit || "Vials",
                unit_cost: 650.0,
                priority: "URGENT",
                lead_time_days: 5,
                supplier_id: 1,
                supplier_name: "MedSupply Corp"
              })}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-xs font-bold text-slate-950 shadow-glow-cyan transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Create Purchase Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Monitored Medicines Quick Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Live Monitored Clinical Supplies</h3>
            <p className="text-xs text-slate-400">Cross-departmental consumption and coverage indicators</p>
          </div>
          <button
            onClick={() => setActivePage('inventory')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All 32 Medicines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3">Medicine</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Current Stock</th>
                <th className="pb-3">Daily Usage</th>
                <th className="pb-3">Coverage</th>
                <th className="pb-3">Criticality</th>
                <th className="pb-3">Stockout Risk</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {recentMeds.map((med) => (
                <tr key={med.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 font-semibold text-white">
                    {med.name}
                    <div className="text-[10px] text-slate-400 font-normal">{med.dosage_form}</div>
                  </td>
                  <td className="py-3">{med.category}</td>
                  <td className="py-3 font-mono font-bold text-slate-100">
                    {med.current_stock} {med.unit}
                  </td>
                  <td className="py-3 font-mono text-slate-300">{med.daily_usage}/day</td>
                  <td className="py-3 font-mono">
                    <span className={med.days_remaining <= 5 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                      {med.days_remaining} days
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      med.criticality === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      med.criticality === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {med.criticality}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      med.stockout_risk === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' :
                      med.stockout_risk === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      med.stockout_risk === 'WARNING' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {med.stockout_risk}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setActivePage('forecast')}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-cyan-300 hover:text-white transition-colors"
                    >
                      Forecast →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ExplainabilityModal
        isOpen={Boolean(explainModalData)}
        onClose={() => setExplainModalData(null)}
        data={explainModalData}
        onAction={() => setActivePage('procurement')}
      />

      <CreateOrderModal
        isOpen={Boolean(orderModalData)}
        onClose={() => setOrderModalData(null)}
        recommendation={orderModalData}
        onSuccess={() => {
          loadDashboard();
          setActivePage('procurement');
        }}
      />
    </div>
  );
}
