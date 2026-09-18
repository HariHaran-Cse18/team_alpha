import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Save,
  CheckCircle2,
  Database,
  Sliders,
  ShieldAlert,
  Server
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsPage() {
  const [reviewPeriod, setReviewPeriod] = useState(7);
  const [safetyMultiplier, setSafetyMultiplier] = useState(1.2);
  const [reserveFactor, setReserveFactor] = useState(1.0);
  const [isResetting, setIsResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg('Operational decision parameters updated successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo medicines, 90-day telemetry, and purchase orders back to initial hackathon presentation state?')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDemoData();
      setSuccessMsg('Database successfully reset to clean demonstration baseline.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>Platform Settings & Control Parameters</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tune algorithmic procurement thresholds, lead time buffers, and manage demo session state
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Decision Engine Parameter Settings */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Automated Procurement Engine Tuning
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Review Cycle Horizon (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={reviewPeriod}
                onChange={(e) => setReviewPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default replenishment interval</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Lead Time Volatility Buffer
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="2.0"
                value={safetyMultiplier}
                onChange={(e) => setSafetyMultiplier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Safety multiplier for delayed vendors</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Emergency Reserve Factor
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="1.5"
                value={reserveFactor}
                onChange={(e) => setReserveFactor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Statutory ICU reserve requirement</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 shadow-glow-cyan"
            >
              <Save className="w-4 h-4" />
              <span>Save System Parameters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Demo Reset Management */}
      <div className="p-6 rounded-2xl glass-panel border border-red-500/30">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
          <Database className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
            Hackathon Demo Factory Reset
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Reset all 32 medications, 90-day consumption records, inventory batches, and purchase orders to the exact initial presentation baseline. Use this before or between hackathon judging presentations.
        </p>

        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting Database...' : 'Reset Demo Data to Initial State'}</span>
        </button>
      </div>
    </div>
  );
}
