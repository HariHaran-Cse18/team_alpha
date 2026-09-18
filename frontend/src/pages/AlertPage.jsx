import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Clock,
  Info,
  CheckCircle2,
  Trash2,
  Filter
} from 'lucide-react';
import { api } from '../services/api';

export default function AlertPage({ setActivePage }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts(severityFilter);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter]);

  const handleMarkRead = async (id) => {
    try {
      await api.markAlertRead(id);
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.resolveAlert(id);
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          badge: 'bg-red-500/20 text-red-300 border-red-500/40 shadow-glow-red animate-pulse',
          icon: AlertOctagon,
          iconColor: 'text-red-400'
        };
      case 'WARNING':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
          iconColor: 'text-amber-400'
        };
      case 'EXPIRY':
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: Clock,
          iconColor: 'text-purple-400'
        };
      default:
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: Info,
          iconColor: 'text-cyan-400'
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-cyan-400" />
            <span>Autonomous Alert Dispatch Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time critical exceptions: stockout risks, surge anomalies, batch expiration thresholds, and supplier dispatch notices
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          Mark All As Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['All', 'CRITICAL', 'WARNING', 'EXPIRY', 'INFO'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              severityFilter === sev
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {sev} Alerts
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            Retrieving clinical exception logs...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs glass-panel rounded-2xl">
            No alerts matching the selected severity level.
          </div>
        ) : (
          alerts.map((alt) => {
            const sevInfo = getSeverityBadge(alt.severity);
            const Icon = sevInfo.icon;

            return (
              <div
                key={alt.id}
                className={`p-4 rounded-2xl glass-card border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  alt.is_read ? 'border-slate-800/80 opacity-85' : 'border-slate-700 bg-slate-900/70'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border bg-slate-950/80 ${sevInfo.badge} shrink-0`}>
                    <Icon className={`w-5 h-5 ${sevInfo.iconColor}`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sevInfo.badge}`}>
                        {alt.severity}
                      </span>
                      {alt.medicine_name && (
                        <span className="text-[11px] font-semibold text-slate-300">
                          {alt.medicine_name}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(alt.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1">
                      {alt.title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                      {alt.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {alt.action_type === 'PROCURE' && (
                    <button
                      onClick={() => setActivePage('procurement')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300"
                    >
                      Procure →
                    </button>
                  )}
                  {alt.action_type === 'TRANSFER' && (
                    <button
                      onClick={() => setActivePage('expiry')}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-bold text-purple-300"
                    >
                      View Batches →
                    </button>
                  )}

                  {!alt.is_read && (
                    <button
                      onClick={() => handleMarkRead(alt.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white"
                    >
                      Mark Read
                    </button>
                  )}

                  {!alt.is_resolved ? (
                    <button
                      onClick={() => handleResolve(alt.id)}
                      className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      title="Resolve Alert"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
