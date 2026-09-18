import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  TrendingUp,
  BrainCircuit,
  ShoppingCart,
  Truck,
  Clock,
  FlaskConical,
  BarChart3,
  Bell,
  Settings,
  Network,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, badge: 'Live' },
  { id: 'inventory', label: 'Inventory Master', icon: Boxes },
  { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp, ai: true },
  { id: 'risks', label: 'Risk Intelligence', icon: BrainCircuit, ai: true },
  { id: 'procurement', label: 'Procurement Center', icon: ShoppingCart, highlight: true },
  { id: 'suppliers', label: 'Supplier Intelligence', icon: Truck },
  { id: 'expiry', label: 'Expiry Monitor', icon: Clock },
  { id: 'simulator', label: 'What-If Simulator', icon: FlaskConical, special: true },
  { id: 'digitaltwin', label: 'Supply Chain Twin', icon: Network },
  { id: 'analytics', label: 'Executive Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alert Dispatch', icon: Bell },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage, isCollapsed, setIsCollapsed }) {
  return (
    <aside
      className={`fixed left-0 top-[57px] bottom-0 z-30 flex flex-col border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-none">
        {/* Landing Page Link */}
        <button
          onClick={() => setActivePage('landing')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activePage === 'landing'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
          title="Landing Page Overview"
        >
          <Home className="w-4 h-4 text-cyan-400 shrink-0" />
          {!isCollapsed && <span>Public Overview</span>}
        </button>

        <div className="my-2 border-t border-slate-800/60" />

        {!isCollapsed && (
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Intelligence Modules
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.ai && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      AI
                    </span>
                  )}
                  {item.special && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      HACKATHON
                    </span>
                  )}
                </div>
              )}

              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400 shadow-glow-cyan" />
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-slate-800/80">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span className="text-[11px]">Collapse View</span>}
        </button>
      </div>
    </aside>
  );
}
