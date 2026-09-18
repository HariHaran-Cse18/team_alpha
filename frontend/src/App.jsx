import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import ForecastPage from './pages/ForecastPage';
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import ProcurementCenterPage from './pages/ProcurementCenterPage';
import SupplierPage from './pages/SupplierPage';
import ExpiryMonitorPage from './pages/ExpiryMonitorPage';
import SimulatorPage from './pages/SimulatorPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertPage from './pages/AlertPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './services/api';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveBanner, setLiveBanner] = useState(null);

  // Live simulation background loop
  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      interval = setInterval(async () => {
        try {
          const res = await api.tickSimulation();
          if (res?.live_consumption_events?.length > 0) {
            setLiveBanner(`Live Telemetry Pulse: Logged consumption for ${res.live_consumption_events.map(e => e.medicine_name).join(', ')}.`);
            setTimeout(() => setLiveBanner(null), 3500);
          }
        } catch (err) {
          console.warn('Simulation tick:', err);
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating]);

  // If user is on landing page, show full-bleed landing page view
  if (activePage === 'landing') {
    return (
      <div className="min-h-screen bg-[#070b13]">
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
        />
        <LandingPage onLaunchCommandCenter={() => setActivePage('dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col">
      {/* Top Fixed Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
      />

      <div className="flex-1 flex relative">
        {/* Left Fixed Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8 ${
            isCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          {/* Live Simulation Floating Banner */}
          {liveBanner && (
            <div className="mb-4 p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-xs text-cyan-300 flex items-center justify-between shadow-glow-cyan animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>{liveBanner}</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80">Re-indexing</span>
            </div>
          )}

          {/* Page Routing */}
          {activePage === 'dashboard' && <Dashboard setActivePage={setActivePage} />}
          {activePage === 'inventory' && <InventoryPage setActivePage={setActivePage} />}
          {activePage === 'forecast' && <ForecastPage />}
          {activePage === 'risks' && <RiskIntelligencePage setActivePage={setActivePage} />}
          {activePage === 'procurement' && <ProcurementCenterPage />}
          {activePage === 'suppliers' && <SupplierPage />}
          {activePage === 'expiry' && <ExpiryMonitorPage />}
          {activePage === 'simulator' && <SimulatorPage setActivePage={setActivePage} />}
          {activePage === 'digitaltwin' && <DigitalTwinPage />}
          {activePage === 'analytics' && <AnalyticsPage />}
          {activePage === 'alerts' && <AlertPage setActivePage={setActivePage} />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
