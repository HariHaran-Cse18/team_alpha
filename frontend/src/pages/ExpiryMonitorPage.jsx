import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Share2,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function ExpiryMonitorPage() {
  const [expiryData, setExpiryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('7_days'); // '7_days' | '30_days' | '90_days' | 'all'
  const [notificationMsg, setNotificationMsg] = useState('');

  const loadExpiry = async () => {
    try {
      setLoading(true);
      const data = await api.getExpiryTimeline();
      setExpiryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpiry();
  }, []);

  const triggerAction = (batch, actionName) => {
    setNotificationMsg(`Action dispatched: "${actionName}" for Batch ${batch.batch_number} (${batch.medicine_name}). Pharmacy team notified.`);
    setTimeout(() => setNotificationMsg(''), 5000);
  };

  const summary = expiryData?.summary || {};
  const timeline = expiryData?.timeline || {};
  const allBatches = expiryData?.all_batches || [];

  const displayedBatches = activeTab === '7_days'
    ? timeline.within_7_days || []
    : activeTab === '30_days'
    ? timeline.within_30_days || []
    : activeTab === '90_days'
    ? timeline.within_90_days || []
    : allBatches;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-purple-400" />
            <span>Clinical Expiry Surveillance & Waste Mitigation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic FEFO (First-Expired, First-Out) tracking, value-at-risk analytics, and clinical reallocation workflows
          </p>
        </div>

        <div className="p-3 rounded-xl glass-card border border-purple-500/30 flex items-center gap-3">
          <TrendingDown className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total Capital At Expiry Risk</div>
            <div className="text-lg font-mono font-extrabold text-white">
              ₹{(summary.total_value_at_risk || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Visual Expiry Timeline Ribbon */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Temporal Expiry Horizon Progression
          </h3>
          <span className="text-[11px] font-mono text-purple-400 font-bold">
            {summary.total_batches_monitored} Batches Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {/* 7 Days Bucket */}
          <div
            onClick={() => setActiveTab('7_days')}
            className={`p-4 rounded-xl cursor-pointer transition-all border ${
              activeTab === '7_days'
                ? 'bg-red-500/15 border-red-500/50 shadow-glow-red'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>≤ 7 DAYS (CRITICAL)</span>
            </div>
            <div className="text-3xl font-black font-mono text-white mt-2">
              {summary.expiring_7_days_count || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Requires immediate ward dispensing</p>
          </div>

          {/* 30 Days Bucket */}
          <div
            onClick={() => setActiveTab('30_days')}
            className={`p-4 rounded-xl cursor-pointer transition-all border ${
              activeTab === '30_days'
                ? 'bg-amber-500/15 border-amber-500/50 shadow-glow-amber'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              ≤ 30 DAYS (WARNING)
            </div>
            <div className="text-3xl font-black font-mono text-white mt-2">
              {summary.expiring_30_days_count || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Inter-departmental transfer recommended</p>
          </div>

          {/* 90 Days Bucket */}
          <div
            onClick={() => setActiveTab('90_days')}
            className={`p-4 rounded-xl cursor-pointer transition-all border ${
              activeTab === '90_days'
                ? 'bg-purple-500/15 border-purple-500/50 shadow-glow-purple'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
              ≤ 90 DAYS (WATCHLIST)
            </div>
            <div className="text-3xl font-black font-mono text-white mt-2">
              {summary.expiring_90_days_count || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">First-Expired First-Out scheduled</p>
          </div>
        </div>
      </div>

      {/* Batch Breakdown Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Batch Telemetry & Recommended Mitigation</h3>
            <p className="text-xs text-slate-400">Select an action to trigger reallocation protocols</p>
          </div>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            View All Batches
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3">Medication</th>
                <th className="pb-3">Batch Number</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Expiry Date</th>
                <th className="pb-3">Days Remaining</th>
                <th className="pb-3">Value At Risk</th>
                <th className="pb-3">Recommended Mitigation</th>
                <th className="pb-3 text-right">Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Scanning batch storage locations...
                  </td>
                </tr>
              ) : displayedBatches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No batches found within this expiry window.
                  </td>
                </tr>
              ) : (
                displayedBatches.map((b) => (
                  <tr key={b.batch_id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 font-semibold text-white">
                      {b.medicine_name}
                      <div className="text-[10px] text-slate-400 font-normal">{b.category}</div>
                    </td>
                    <td className="py-3 font-mono font-bold text-cyan-300">{b.batch_number}</td>
                    <td className="py-3 font-mono font-bold text-white">{b.quantity} {b.unit}</td>
                    <td className="py-3 font-mono text-slate-300">{b.expiry_date}</td>
                    <td className="py-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.days_remaining <= 7 ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' :
                        b.days_remaining <= 30 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'text-emerald-400'
                      }`}>
                        {b.days_remaining} days
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-200">
                      ₹{b.value_at_risk.toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-300">
                      {b.recommended_action}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => triggerAction(b, b.recommended_action)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 hover:text-white transition-colors"
                      >
                        Action →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
