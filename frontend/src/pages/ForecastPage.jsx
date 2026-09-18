import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Layers,
  Info,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../services/api';

export default function ForecastPage() {
  const [medicines, setMedicines] = useState([]);
  const [selectedId, setSelectedId] = useState(1);
  const [horizon, setHorizon] = useState(14);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load medicines list
  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const list = await api.getInventory();
        setMedicines(list);
        if (list.length > 0 && !selectedId) {
          setSelectedId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeds();
  }, []);

  // Load forecast for selected medicine and horizon
  useEffect(() => {
    if (!selectedId) return;
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const res = await api.getForecast(selectedId, horizon);
        setForecastData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [selectedId, horizon]);

  // Merge historical and forecast points into a continuous chart dataset
  const chartData = [];
  if (forecastData) {
    // Historical points
    (forecastData.historical_points || []).slice(-15).forEach((hp) => {
      chartData.push({
        date: hp.date.slice(5),
        actual: hp.actual,
        predicted: null,
        lower: null,
        upper: null,
        is_abnormal: hp.is_abnormal
      });
    });

    // Last historical point connects to forecast
    const lastHist = chartData[chartData.length - 1];

    (forecastData.forecast_points || []).forEach((fp, idx) => {
      chartData.push({
        date: fp.date.slice(5),
        actual: idx === 0 && lastHist ? lastHist.actual : null,
        predicted: fp.predicted,
        lower: fp.lower_bound,
        upper: fp.upper_bound,
        isForecast: true
      });
    });
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <span>AI Demand Forecasting Dashboard</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              RandomForest ML
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-step regression forecasting on 90-day hospital consumption with 95% confidence intervals
          </p>
        </div>

        {/* Controls: Medicine Selector & Horizon Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
          >
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.category})
              </option>
            ))}
          </select>

          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setHorizon(days)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  horizon === days
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          Calculating time-series predictions...
        </div>
      ) : forecastData ? (
        <>
          {/* 4 Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs font-semibold uppercase text-slate-400">Current 7-Day Average</span>
              <div className="text-2xl font-mono font-extrabold text-white mt-1">
                {forecastData.current_avg_daily} <span className="text-xs font-normal text-slate-400">units/day</span>
              </div>
              <span className="text-[11px] text-slate-500">Historical ward baseline</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs font-semibold uppercase text-slate-400">Predicted Future Average</span>
              <div className="text-2xl font-mono font-extrabold text-cyan-300 mt-1">
                {forecastData.predicted_avg_daily} <span className="text-xs font-normal text-cyan-500/80">units/day</span>
              </div>
              <span className="text-[11px] text-slate-500">{horizon}-day horizon projection</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs font-semibold uppercase text-slate-400">Demand Change Velocity</span>
              <div className={`text-2xl font-mono font-extrabold mt-1 flex items-center gap-1 ${
                forecastData.demand_change_percent > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {forecastData.demand_change_percent > 0 ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
                <span>{forecastData.demand_change_percent > 0 ? `+${forecastData.demand_change_percent}%` : `${forecastData.demand_change_percent}%`}</span>
              </div>
              <span className="text-[11px] text-slate-500">Relative to current baseline</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <span className="text-xs font-semibold uppercase text-slate-400">Trend & Confidence</span>
              <div className="text-xl font-extrabold text-white mt-1">
                {forecastData.trend}
              </div>
              <span className="text-[11px] text-purple-300 font-mono">
                {forecastData.confidence_level} Confidence (95% CI)
              </span>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Historical Consumption vs. Machine Learning Forecast
                </h3>
                <p className="text-xs text-slate-400">
                  Solid Line: Actual ward dispensations | Dashed Line: Predicted demand | Shaded Envelope: 95% Confidence Interval
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-400" />
                  <span className="text-slate-300">Actual Usage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-teal-400 border-dashed" />
                  <span className="text-teal-300">Predicted Demand</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/40" />
                  <span className="text-slate-400">95% Uncertainty Band</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <defs>
                    <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc'
                    }}
                  />
                  {/* Confidence Envelope Area */}
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="transparent"
                    fill="url(#confidenceGrad)"
                    name="Upper Bound (95%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="transparent"
                    fill="#070b13"
                    name="Lower Bound (95%)"
                  />
                  {/* Actual Consumption Line */}
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ fill: '#06b6d4', r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Actual Consumption"
                  />
                  {/* Forecast Line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#14b8a6"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ fill: '#14b8a6', r: 3 }}
                    name="Forecast Demand"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Explanation & Diagnostic Factors */}
          <div className="p-5 rounded-2xl glass-card border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                AI Demand Forecasting Rationale
              </h4>
            </div>
            <p className="text-sm font-semibold text-slate-100 leading-relaxed">
              "{forecastData.explanation}"
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400">
              {forecastData.factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
