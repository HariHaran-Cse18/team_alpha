import React from 'react';
import { ShieldCheck, AlertCircle, AlertOctagon, RefreshCw } from 'lucide-react';

export default function HealthRing({
  healthScore = 82,
  stockCoverage = 76,
  emergencyReserve = 91,
  healthyCount = 20,
  warningCount = 7,
  criticalCount = 5,
  expiredCount = 2
}) {
  // SVG circular calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="relative p-6 rounded-2xl glass-panel border border-slate-800/80 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Inventory Health & Reserve Index
          </h3>
          <p className="text-xs text-slate-400">Dynamic multi-parameter clinical resilience score</p>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300">
          Real-Time Assessment
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Central Radial Gauge */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-800/80"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Secondary Outer Ring (Coverage) */}
              <circle
                cx="100"
                cy="100"
                r={radius + 12}
                className="stroke-teal-500/20"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r={radius + 12}
                className="stroke-teal-400"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * (radius + 12)}
                strokeDashoffset={2 * Math.PI * (radius + 12) - (stockCoverage / 100) * 2 * Math.PI * (radius + 12)}
                strokeLinecap="round"
                fill="transparent"
              />
              {/* Primary Health Ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-cyan-400 transition-all duration-1000 ease-out"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))'
                }}
              />
            </svg>

            {/* Gauge Center Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black tracking-tight text-white drop-shadow">
                {healthScore}%
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                Resilience Index
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {healthScore >= 80 ? 'Optimal Status' : healthScore >= 60 ? 'Moderate Risk' : 'Intervention Needed'}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Gauges and Indicators */}
        <div className="md:col-span-6 space-y-3.5">
          {/* Stock Coverage Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Stock Coverage Margin</span>
              <span className="text-teal-400 font-bold font-mono">{stockCoverage}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${stockCoverage}%` }}
              />
            </div>
          </div>

          {/* Emergency Reserve Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Emergency Reserve Compliance</span>
              <span className="text-emerald-400 font-bold font-mono">{emergencyReserve}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${emergencyReserve}%` }}
              />
            </div>
          </div>

          {/* Four Status Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-emerald-300">{healthyCount} Items</div>
                <div className="text-[10px] text-emerald-400/80">Healthy Stock</div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-amber-300">{warningCount} Items</div>
                <div className="text-[10px] text-amber-400/80">Safety Buffer</div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-xs font-bold text-red-300">{criticalCount} Items</div>
                <div className="text-[10px] text-red-400/80">Stockout Risk</div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-purple-300">{expiredCount} Batches</div>
                <div className="text-[10px] text-purple-400/80">Expiring Soon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
