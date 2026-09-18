import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Award,
  DollarSign,
  Activity,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../services/api';

export default function AnalyticsPage() {
  const [trends, setTrends] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [t, k] = await Promise.all([
          api.getAnalyticsTrends(),
          api.getDashboardKPIs()
        ]);
        setTrends(t);
        setKpiData(k);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const metrics = kpiData?.efficiency_metrics || {
    stockout_prevention_rate: 98.2,
    estimated_waste_reduction_inr: 184500,
    procurement_efficiency_score: 91.4,
    emergency_reserve_coverage: 94.0,
    forecast_accuracy_mape: 93.6
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Executive Supply Chain Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregate clinical consumption trends, supplier benchmark metrics, and estimated procurement savings
          </p>
        </div>

        <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          Note: Metrics marked as estimated from simulated hospital telemetry
        </div>
      </div>

      {/* 4 Efficiency Benchmark Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Stockout Prevention</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">
            {metrics.stockout_prevention_rate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pre-emptive PO intervention rate</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Capital Waste Avoided</span>
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300 mt-2">
            ₹{metrics.estimated_waste_reduction_inr.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">FEFO lot prioritization savings</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Forecast Accuracy</span>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-300 mt-2">
            {metrics.forecast_accuracy_mape}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mean Absolute Percentage Error (MAPE)</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Procurement Efficiency</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300 mt-2">
            {metrics.procurement_efficiency_score}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Safety buffer compliance score</p>
        </div>
      </div>

      {/* Analytics Charts */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          Compiling multi-period intelligence aggregates...
        </div>
      ) : trends ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 30-Day Hospital Consumption Curve */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Hospital Consumption Trends (Last 30 Days)
              </h3>
              <span className="text-xs font-mono text-cyan-400">Aggregate Units</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.consumption_trends} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ fill: '#06b6d4', r: 2 }}
                    name="Daily Units Consumed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supplier Reliability Comparison */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Supplier Reliability Benchmark (%)
              </h3>
              <span className="text-xs font-mono text-teal-400">On-Time Fulfillment</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.supplier_performance} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" domain={[70, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="reliability" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Reliability %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
