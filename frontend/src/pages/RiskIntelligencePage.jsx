import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Clock,
  Truck,
  Eye,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import ExplainabilityModal from '../components/ExplainabilityModal';
import { api } from '../services/api';

export default function RiskIntelligencePage({ setActivePage }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItemForExplain, setSelectedItemForExplain] = useState(null);

  const loadRisks = async () => {
    try {
      setLoading(true);
      const data = await api.getRisks();
      setRiskData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const getRiskBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-glow-red animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'WARNING':
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
  };

  const matrix = riskData?.matrix || [];
  const filteredMatrix = activeCategory === 'All'
    ? matrix
    : matrix.filter(m => m.category === activeCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <BrainCircuit className="w-6 h-6 text-red-400" />
              <span>Hospital Risk Intelligence Engine</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
              Multi-Factor Surveillance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic risk scoring cross-correlating stockout hazards, batch expiries, abnormal ward consumption, and supplier logistics
          </p>
        </div>

        {/* Severity Metrics */}
        {riskData && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 font-bold">
              {riskData.critical_count} CRITICAL
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
              {riskData.high_count} HIGH
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 font-bold">
              {riskData.warning_count} WARNING
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
              {riskData.low_count} LOW
            </span>
          </div>
        )}
      </div>

      {/* 5 Core Risk Dimensions Showcase */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'STOCKOUT RISK', desc: 'Coverage < Lead Time window', icon: ShieldAlert, color: 'text-red-400' },
          { label: 'EXPIRY RISK', desc: 'Batch threshold ≤ 30 days', icon: Clock, color: 'text-purple-400' },
          { label: 'ABNORMAL USAGE', desc: 'Consumption > +25% baseline', icon: TrendingUp, color: 'text-amber-400' },
          { label: 'SUPPLIER DELAY', desc: 'Reliability & vendor lead time', icon: Truck, color: 'text-cyan-400' },
          { label: 'RESERVE BREACH', desc: 'Statutory emergency reserve', icon: BrainCircuit, color: 'text-rose-400' },
        ].map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div key={idx} className="p-3.5 rounded-xl glass-card border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${cat.color}`} />
                <span className="text-[10px] font-mono text-slate-500">DIM-0{idx + 1}</span>
              </div>
              <div className="text-xs font-bold text-white tracking-wide">{cat.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Risk Matrix Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Clinical Risk Matrix & Diagnostics</h3>
            <p className="text-xs text-slate-400">
              Click "Why?" on any item to view explainable diagnostic evidence
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['All', 'Critical Care', 'Antibiotics', 'Analgesics', 'Emergency'].map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === c
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3">Medicine</th>
                <th className="pb-3 text-center">Stockout</th>
                <th className="pb-3 text-center">Expiry</th>
                <th className="pb-3 text-center">Usage</th>
                <th className="pb-3 text-center">Supplier</th>
                <th className="pb-3 text-center">Reserve</th>
                <th className="pb-3 text-center">Overall</th>
                <th className="pb-3 text-right">Why?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Evaluating risk telemetry...
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((item) => (
                  <tr key={item.medicine_id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-white">{item.medicine_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.category} • Coverage: {item.days_remaining}d
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskBadge(item.stockout_risk)}`}>
                        {item.stockout_risk}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskBadge(item.expiry_risk)}`}>
                        {item.expiry_risk}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskBadge(item.abnormal_usage_risk)}`}>
                        {item.abnormal_usage_risk}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskBadge(item.supplier_delay_risk)}`}>
                        {item.supplier_delay_risk}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskBadge(item.reserve_breach_risk)}`}>
                        {item.reserve_breach_risk}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold font-mono ${getRiskBadge(item.overall_risk)}`}>
                        {item.overall_risk} ({item.overall_risk_score})
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedItemForExplain({
                          medicine_name: item.medicine_name,
                          summary: `Overall Risk Level: ${item.overall_risk} (${item.overall_risk_score}/100 composite index).`,
                          reasons: item.why_explanation
                        })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-cyan-300 hover:text-white transition-colors"
                      >
                        <HelpCircle className="w-3 h-3 text-cyan-400" />
                        <span>Why?</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainability Modal */}
      <ExplainabilityModal
        isOpen={Boolean(selectedItemForExplain)}
        onClose={() => setSelectedItemForExplain(null)}
        data={selectedItemForExplain}
        onAction={() => setActivePage('procurement')}
      />
    </div>
  );
}
