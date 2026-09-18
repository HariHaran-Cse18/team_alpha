import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Cpu, Calculator } from 'lucide-react';

export default function ExplainabilityModal({ isOpen, onClose, data, onAction }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-400 shadow-glow-cyan" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-glow-cyan">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Explainable AI Diagnostics
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Rule & ML Hybrid
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {data.medicine_name || data.title || "AI Clinical Supply Justification"}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Diagnostic Rationale Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase text-amber-300">Why was this assessment generated?</div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {data.summary || data.explanation || "MEDORA evaluated multi-echelon telemetry: recent ward consumption velocity, emergency reserve compliance, supplier lead time, and pending orders."}
              </p>
            </div>
          </div>

          {/* Diagnostic Checkpoints */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Verified Telemetry Evidence
            </h4>
            <div className="space-y-2">
              {(data.reasons || data.why_explanation || [
                "Stock consumption velocity is outpacing baseline replenishments.",
                "Remaining inventory coverage is less than supplier lead time window.",
                "Inventory projected to breach mandatory Emergency Reserve threshold.",
                "Zero incoming purchase orders detected in transit."
              ]).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-xs text-slate-200">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formula Breakdown if available */}
          {data.formula_breakdown && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                <Calculator className="w-4 h-4 text-teal-400" />
                <span>Deterministic Calculation Logic</span>
              </div>
              <div className="font-mono text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-teal-300 leading-relaxed overflow-x-auto">
                <div>Target = (Forecast Demand: {data.formula_breakdown.forecast_demand}) + (Safety Stock: {data.formula_breakdown.safety_reserve}) + (Reserve: {data.formula_breakdown.emergency_reserve})</div>
                <div className="mt-1">Order = max(0, Target [{data.formula_breakdown.target_stock}] - Available [{data.formula_breakdown.current_stock} stock + {data.formula_breakdown.incoming_stock} in-transit])</div>
                <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-white font-bold">
                  Recommended PO = {data.formula_breakdown.recommended_quantity} units
                </div>
              </div>
            </div>
          )}

          {/* Critical Disclaimer Notice */}
          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400">
            <span className="font-bold text-slate-300">Decision-Support Notice:</span> MEDORA recommendations provide clinical inventory decision guidance. Procurement quantities may be adjusted based on departmental budget and facility storage limits.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            Dismiss
          </button>
          {onAction && (
            <button
              onClick={() => {
                onAction(data);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 transition-all shadow-glow-cyan"
            >
              <span>Proceed to Procurement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
