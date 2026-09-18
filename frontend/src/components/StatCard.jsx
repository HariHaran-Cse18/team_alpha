import React, { useEffect, useState } from 'react';

export default function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  trend,
  color = 'cyan', // cyan, red, amber, green, purple
  description
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = typeof value === 'number' ? value : parseInt(value, 10) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 800; // ms
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const colorStyles = {
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
      glow: 'shadow-glow-cyan',
      text: 'text-cyan-400'
    },
    red: {
      border: 'hover:border-red-500/40',
      iconBg: 'bg-red-500/10 text-red-400 border-red-500/25',
      glow: 'shadow-glow-red',
      text: 'text-red-400'
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      glow: 'shadow-glow-amber',
      text: 'text-amber-400'
    },
    green: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      glow: 'shadow-glow-green',
      text: 'text-emerald-400'
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      glow: 'shadow-glow-purple',
      text: 'text-purple-400'
    }
  }[color] || {
    border: 'hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    glow: 'shadow-glow-cyan',
    text: 'text-cyan-400'
  };

  return (
    <div className={`relative p-5 rounded-2xl glass-card transition-all duration-300 ${colorStyles.border} group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles.iconBg} transition-transform group-hover:scale-110`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
          {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>{description || 'Clinical Inventory Tracker'}</span>
        {trend && (
          <span className={`font-semibold ${trend.startsWith('+') ? 'text-amber-400' : 'text-emerald-400'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
