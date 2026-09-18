import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Layers,
  CheckCircle2,
  Trash2,
  Edit2
} from 'lucide-react';
import { api } from '../services/api';

export default function InventoryPage({ setActivePage }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [criticality, setCriticality] = useState('All');
  const [risk, setRisk] = useState('All');
  const [sortBy, setSortBy] = useState('days_remaining');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Critical Care',
    dosage_form: 'Injection',
    unit: 'Vials',
    unit_cost: 150.0,
    criticality: 'HIGH',
    minimum_stock: 200,
    safety_stock: 120,
    emergency_reserve: 80
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getInventory({
        category,
        criticality,
        risk,
        search
      });
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category, criticality, risk, search]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.createMedicine(newItem);
      setShowAddModal(false);
      setNewItem({
        name: '',
        category: 'Critical Care',
        dosage_form: 'Injection',
        unit: 'Vials',
        unit_cost: 150.0,
        criticality: 'HIGH',
        minimum_stock: 200,
        safety_stock: 120,
        emergency_reserve: 80
      });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to add medicine');
    }
  };

  // Sort logic
  const sortedItems = [...items].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const categories = ['All', 'Critical Care', 'Antibiotics', 'Analgesics', 'Emergency', 'Fluids & Consumables', 'Chronic Care'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-cyan-400" />
            <span>Hospital Inventory Master</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock levels, daily consumption velocity, batch expiries, and automated safety stock surveillance
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-glow-cyan transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Clinical Supply</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicine or active ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Criticality & Risk Filters */}
        <div className="flex items-center gap-2">
          <select
            value={criticality}
            onChange={(e) => setCriticality(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">Criticality: All</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">Risk: All</option>
            <option value="CRITICAL">CRITICAL Risk</option>
            <option value="HIGH">HIGH Risk</option>
            <option value="WARNING">WARNING</option>
            <option value="LOW">LOW Risk</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Medicine</th>
                <th className="py-3 px-4">Category</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-cyan-400"
                  onClick={() => { setSortBy('current_stock'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                >
                  <div className="flex items-center gap-1">
                    <span>Current Stock</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Daily Usage</th>
                <th className="py-3 px-4">Safety Stock</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-cyan-400"
                  onClick={() => { setSortBy('days_remaining'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                >
                  <div className="flex items-center gap-1">
                    <span>Days Remaining</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4">Criticality</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400">
                    Loading inventory data...
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400">
                    No medications match the current filter criteria.
                  </td>
                </tr>
              ) : (
                sortedItems.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{med.name}</div>
                      <div className="text-[10px] text-slate-400">{med.dosage_form} • ₹{med.unit_cost.toFixed(1)}/unit</div>
                    </td>
                    <td className="py-3 px-4">{med.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">
                      {med.current_stock} <span className="text-[10px] text-slate-400 font-normal">{med.unit}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">{med.daily_usage}/day</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{med.safety_stock}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        med.days_remaining <= 3 ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' :
                        med.days_remaining <= 6 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'text-emerald-400'
                      }`}>
                        {med.days_remaining} days
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {med.days_to_expiry !== null ? (
                        <span className={med.days_to_expiry <= 15 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {med.days_to_expiry} days
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        med.criticality === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        med.criticality === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        med.criticality === 'MEDIUM' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {med.criticality}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        med.stockout_risk === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        med.stockout_risk === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        med.stockout_risk === 'WARNING' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {med.stockout_risk}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[120px]">
                      {med.supplier_name || 'MedSupply Corp'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedMedicine(med)}
                          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-medium text-cyan-300 hover:text-white"
                          title="View batch breakdown"
                        >
                          Batches
                        </button>
                        <button
                          onClick={() => setActivePage('forecast')}
                          className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300"
                          title="Forecast AI"
                        >
                          Forecast
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batches Breakdown Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedMedicine.name}</h3>
                <p className="text-xs text-slate-400">Inventory Batches & Storage Vault Allocation</p>
              </div>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              {selectedMedicine.batches.map(b => (
                <div key={b.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-cyan-300">{b.batch_number}</div>
                    <div className="text-[11px] text-slate-400">Location: {b.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">{b.quantity} {selectedMedicine.unit}</div>
                    <div className={`text-[10px] font-bold ${
                      b.days_to_expiry <= 7 ? 'text-red-400' :
                      b.days_to_expiry <= 30 ? 'text-amber-400' :
                      'text-emerald-400'
                    }`}>
                      Expires: {b.expiry_date} ({b.days_to_expiry} days)
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMedicine(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-cyan-500/30 p-6">
            <h3 className="text-base font-bold text-white mb-4">Add Hospital Medication</h3>
            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Ciprofloxacin 500mg"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Criticality</label>
                  <select
                    value={newItem.criticality}
                    onChange={(e) => setNewItem({ ...newItem, criticality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={newItem.unit_cost}
                    onChange={(e) => setNewItem({ ...newItem, unit_cost: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newItem.minimum_stock}
                    onChange={(e) => setNewItem({ ...newItem, minimum_stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Emergency Reserve</label>
                  <input
                    type="number"
                    value={newItem.emergency_reserve}
                    onChange={(e) => setNewItem({ ...newItem, emergency_reserve: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 shadow-glow-cyan"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
