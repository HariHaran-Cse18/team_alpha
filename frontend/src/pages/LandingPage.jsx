import React from 'react';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Clock,
  ShoppingCart,
  Truck,
  Sparkles,
  Layers,
  Database,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function LandingPage({ onLaunchCommandCenter }) {
  const supplyNodes = [
    { name: 'Hospital Wards & ICUs', desc: 'Real-time consumption telemetry', icon: Layers, color: 'text-cyan-400', border: 'border-cyan-500/40' },
    { name: 'Central Pharmacy', desc: 'Batch & emergency reserve stock', icon: Database, color: 'text-teal-400', border: 'border-teal-500/40' },
    { name: 'AI Demand Forecast', desc: 'RandomForest predictive regression', icon: TrendingUp, color: 'text-purple-400', border: 'border-purple-500/40' },
    { name: 'Multi-Risk Engine', desc: 'Stockout & expiry horizon detection', icon: BrainCircuit, color: 'text-red-400', border: 'border-red-500/40' },
    { name: 'Procurement Engine', desc: 'Deterministic order quantity formula', icon: ShoppingCart, color: 'text-amber-400', border: 'border-amber-500/40' },
    { name: 'Supplier Logistics', desc: 'Lead time & reliability tracking', icon: Truck, color: 'text-emerald-400', border: 'border-emerald-500/40' },
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 bg-grid-pattern relative overflow-hidden">
      {/* Background Radiance Glows */}
      <div className="glow-spot-cyan top-10 left-1/4" />
      <div className="glow-spot-teal bottom-20 right-10" />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-widest shadow-glow-cyan mb-6 animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Healthcare Supply Chain Intelligence</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-white bg-clip-text text-transparent">
            MEDORA AI
          </span>
        </h1>

        <p className="text-xl sm:text-2xl font-bold text-cyan-400 tracking-wide mb-6">
          "Predict. Prevent. Procure."
        </p>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 font-normal leading-relaxed mb-10">
          Intelligent healthcare supply-chain command center that predicts demand, detects stockout and expiry hazards, and orchestrates explainable procurement decisions before critical care is compromised.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onLaunchCommandCenter}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 transition-all shadow-glow-cyan transform hover:-translate-y-0.5"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#architecture"
            className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700 transition-all"
          >
            Explore Intelligence Flow
          </a>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20">
          {[
            { label: 'Risk Visibility', val: '98.2%', sub: 'Pre-stockout early warning' },
            { label: 'Monitoring Horizon', val: '24/7', sub: 'Autonomous continuous telemetry' },
            { label: 'Forecasting Accuracy', val: '93.6%', sub: 'Local ML Random Forest' },
            { label: 'Expiry Intelligence', val: '100%', sub: 'Batch level tracking' }
          ].map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl glass-card text-left">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300">{m.val}</div>
              <div className="text-xs font-semibold text-slate-200 mt-1">{m.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Interactive Animated Supply-Chain Particle Flow */}
        <div id="architecture" className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 text-left relative">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                  Supply Chain Digital Twin Architecture
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Autonomous data pipeline from clinical ward demand to verified supplier fulfillment
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              Active Closed-Loop
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 sm:gap-4 relative">
            {supplyNodes.map((node, i) => {
              const Icon = node.icon;
              return (
                <div
                  key={i}
                  className={`p-4 rounded-xl bg-slate-950/70 border ${node.border} relative group hover:scale-[1.02] transition-transform`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      STEP 0{i + 1}
                    </span>
                    <Icon className={`w-5 h-5 ${node.color}`} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {node.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {node.desc}
                  </p>
                  {i < supplyNodes.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl glass-card border border-slate-800">
            <TrendingUp className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Predictive Inventory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trains multi-step regressors on 90-day hospital consumption records with day-of-week seasonality and rolling momentum vectors to project future demand.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-teal-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Stockout & Reserve Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors statutory emergency reserve thresholds against supplier delivery windows. Escalates to CRITICAL prior to inventory reaching safety margins.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800">
            <BrainCircuit className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Explainable AI Procurement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every single order recommendation presents exact deterministic mathematical justifications: lead time, coverage target, active buffer, and pipeline POs.
            </p>
          </div>
        </div>

        {/* Regulatory & Clinical Disclaimer */}
        <div className="mt-16 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-500 max-w-3xl mx-auto">
          <span className="font-semibold text-slate-400">Clinical Decision-Support Disclaimer:</span> MEDORA AI is engineered solely to optimize hospital supply chain operations and procurement decision-making. It does not provide medical diagnoses, treatment regimens, or replace licensed healthcare practitioners.
        </div>
      </div>
    </div>
  );
}
