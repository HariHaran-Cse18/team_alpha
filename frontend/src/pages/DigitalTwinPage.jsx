import React, { useState } from 'react';
import {
  Network,
  Layers,
  Database,
  Truck,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
  Box
} from 'lucide-react';

export default function DigitalTwinPage() {
  const [activeNode, setActiveNode] = useState('pharmacy');

  const nodes = {
    wards: {
      id: 'wards',
      title: 'Hospital Clinical Wards & ICUs',
      type: 'Consumption Source',
      status: 'High Demand Velocity',
      statusColor: 'text-amber-400',
      metrics: [
        { label: 'Active Wards Monitored', val: '14 Units (ICU, Emergency, Surgery)' },
        { label: 'Aggregate Consumption', val: '1,480 units/day' },
        { label: 'Telemetry Pulse Interval', val: 'Every 5 seconds' },
        { label: 'Anomaly Spikes Flagged', val: 'Insulin Glargine (+22%), Meropenem (+24%)' }
      ],
      description: 'Point-of-care dispensing telemetry capturing patient dose administrations across critical wards in real-time.'
    },
    pharmacy: {
      id: 'pharmacy',
      title: 'Central Pharmacy & Cold Vault',
      type: 'Primary Storage Echelon',
      status: 'Operational Resilience 82%',
      statusColor: 'text-cyan-400',
      metrics: [
        { label: 'Total Tracked SKU Batches', val: '52 Active Batches' },
        { label: 'Emergency Reserve Compliance', val: '91% of Statutory Buffer Met' },
        { label: 'Refrigerated Storage Status', val: 'Optimal 3.4°C Vault R-2' },
        { label: 'Capital Value on Hand', val: '₹1,840,000' }
      ],
      description: 'Central hospital dispensing hub orchestrating quarantine verification, emergency reserves, and FEFO lot allocations.'
    },
    engine: {
      id: 'engine',
      title: 'MEDORA AI Intelligence Engine',
      type: 'Cognitive Decision Core',
      status: 'Autonomous Optimization',
      statusColor: 'text-purple-400',
      metrics: [
        { label: 'Forecasting Horizon', val: '7, 14, 30 Days Continuous' },
        { label: 'Regression Architecture', val: 'Random Forest + Lag Features' },
        { label: 'Risk Calculation Frequency', val: 'Real-time deterministic' },
        { label: 'Stockout Prevention Rate', val: '98.2% Simulated' }
      ],
      description: 'Multi-parameter clinical neural layer predicting patient demand and computing exact mathematical order quantities.'
    },
    logistics: {
      id: 'logistics',
      title: 'Active Inbound Logistics Fleet',
      type: 'Supply Pipeline',
      status: '8 Purchase Orders In-Transit',
      statusColor: 'text-teal-400',
      metrics: [
        { label: 'Incoming Inventory Volume', val: '2,950 Units' },
        { label: 'Earliest Scheduled Arrival', val: 'Tomorrow, 08:30 AM (Normal Saline)' },
        { label: 'Average Courier Speed', val: '4.2 Days Regional Air/Ground' },
        { label: 'Delayed Consignments', val: '0 Shipments' }
      ],
      description: 'Real-time visibility over manufacturer dispatch, transit corridors, and expected delivery fulfillment dates.'
    },
    suppliers: {
      id: 'suppliers',
      title: 'Verified Pharmaceutical Suppliers',
      type: 'Supply Partners',
      status: '10 Contracted Vendors',
      statusColor: 'text-emerald-400',
      metrics: [
        { label: 'Average Vendor Reliability', val: '91.8% On-Time' },
        { label: 'Shortest Lead Time Partner', val: 'ZenMed Surgicals (3 Days)' },
        { label: 'Quality Audit Compliance', val: '98.4% ISO Certified' },
        { label: 'Direct EDI Integration', val: 'Enabled' }
      ],
      description: 'Primary pharmaceutical distributors under service level agreements (SLAs) for continuous hospital replenishment.'
    }
  };

  const selected = nodes[activeNode] || nodes.pharmacy;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Network className="w-6 h-6 text-cyan-400" />
              <span>Supply Chain Digital Twin Simulator</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Interactive Echelon Map
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic end-to-end topology representing physical hospital supply movement from manufacturing plants to patient bedside
          </p>
        </div>
      </div>

      {/* Interactive Node Flow Diagram */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Multi-Echelon Pipeline Architecture
          </h3>
          <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Live Sync
          </span>
        </div>

        {/* Nodes Flow Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { id: 'wards', title: 'Hospital Wards', icon: Layers, color: 'text-amber-400', border: 'border-amber-500/40' },
            { id: 'pharmacy', title: 'Central Pharmacy', icon: Database, color: 'text-cyan-400', border: 'border-cyan-500/40' },
            { id: 'engine', title: 'AI Decision Engine', icon: Activity, color: 'text-purple-400', border: 'border-purple-500/40' },
            { id: 'suppliers', title: 'Suppliers (10)', icon: Box, color: 'text-emerald-400', border: 'border-emerald-500/40' },
            { id: 'logistics', title: 'In-Transit Logistics', icon: Truck, color: 'text-teal-400', border: 'border-teal-500/40' }
          ].map((n) => {
            const Icon = n.icon;
            const isSel = activeNode === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setActiveNode(n.id)}
                className={`p-4 rounded-xl text-left transition-all relative ${
                  isSel
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-glow-cyan scale-102 border'
                    : 'bg-slate-950/60 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${n.color}`} />
                  {isSel && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
                <div className="text-xs font-bold text-white">{n.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Inspect Echelon →</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Echelon Inspector */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {selected.type}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 ${selected.statusColor}`}>
                {selected.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{selected.title}</h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl mb-6">
          {selected.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selected.metrics.map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{m.label}</span>
              <span className="text-sm font-bold text-white font-mono">{m.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
