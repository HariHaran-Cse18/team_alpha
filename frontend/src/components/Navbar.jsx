import React, { useState, useEffect } from 'react';
import { Activity, Bell, Shield, Sparkles, Play, Square, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Navbar({ activePage, setActivePage, isSimulating, setIsSimulating }) {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await api.getAlerts();
        setRecentAlerts(data.slice(0, 4));
        setUnreadCount(data.filter(a => !a.is_read).length);
      } catch (e) {
        console.error(e);
      }
    };
    loadAlerts();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-6 py-2.5 flex items-center justify-between">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => setActivePage('landing')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 shadow-glow-cyan group-hover:border-cyan-400 transition-all">
            <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse-slow" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-white bg-clip-text text-transparent">
                MEDORA AI
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                v2.0
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-slate-400">
              Predict. Prevent. Procure.
            </p>
          </div>
        </div>

        <div className="hidden xl:flex items-center ml-6 pl-6 border-l border-slate-800 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Decision-Support Active
          </span>
        </div>
      </div>

      {/* Center Live Simulation Status */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
            isSimulating
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-glow-amber animate-pulse'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300'
          }`}
          title="Toggle live periodic background simulation of ward consumption"
        >
          {isSimulating ? (
            <>
              <Square className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Simulation Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>Start Live Simulation</span>
            </>
          )}
        </button>

        <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          <span className="text-cyan-300 font-semibold">{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white ring-2 ring-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Clinical Supply Alerts</span>
                </div>
                <button
                  onClick={() => {
                    api.markAllAlertsRead();
                    setUnreadCount(0);
                  }}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2.5 mt-3 max-h-72 overflow-y-auto">
                {recentAlerts.map(alt => (
                  <div 
                    key={alt.id}
                    onClick={() => {
                      setActivePage('alerts');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        alt.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        alt.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        alt.severity === 'EXPIRY' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {alt.severity}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">{alt.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{alt.message}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setActivePage('alerts');
                  setShowNotifications(false);
                }}
                className="w-full mt-3 py-1.5 text-center text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/50 rounded-lg transition-colors border border-cyan-500/20"
              >
                View All Alerts Center →
              </button>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center font-bold text-xs text-slate-950 ring-1 ring-cyan-400/40">
            {user?.full_name?.split(' ').map(n => n[0]).join('') || 'AV'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.full_name || 'Dr. Alistair Vance'}
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              {user?.hospital_name?.slice(0, 24) || 'Apollo Medical Center'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
