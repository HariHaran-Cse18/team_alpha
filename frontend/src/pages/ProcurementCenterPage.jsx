import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Truck,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Eye,
  RefreshCw,
  PackageCheck
} from 'lucide-react';
import ExplainabilityModal from '../components/ExplainabilityModal';
import CreateOrderModal from '../components/CreateOrderModal';
import { api } from '../services/api';

export default function ProcurementCenterPage() {
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'orders'
  const [recommendations, setRecommendations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [explainModalData, setExplainModalData] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recs, poList] = await Promise.all([
        api.getRecommendations(),
        api.getPurchaseOrders()
      ]);
      setRecommendations(recs);
      setOrders(poList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeliverPO = async (poId) => {
    try {
      await api.updateOrderStatus(poId, 'DELIVERED');
      loadData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-glow-red animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ShoppingCart className="w-6 h-6 text-cyan-400" />
              <span>Smart Procurement Decision Center</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Autonomous Math Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated replenishment recommendation formula: Forecast Demand + Safety Stock + Emergency Reserve - Available Stock
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'recommendations'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Recommendations ({recommendations.filter(r => r.recommended_quantity > 0).length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Purchase Orders ({orders.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs">
          Computing optimal procurement vectors...
        </div>
      ) : activeTab === 'recommendations' ? (
        <div className="space-y-4">
          {/* Recommendation Table */}
          <div className="rounded-2xl glass-panel border border-slate-800 p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Replenishment Priority Queue</h3>
                <p className="text-xs text-slate-400">Order quantities calculated to maintain zero stockout risk</p>
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Recalculate Orders</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Medicine</th>
                    <th className="pb-3">Current Stock</th>
                    <th className="pb-3">Forecast Demand</th>
                    <th className="pb-3">Safety Reserve</th>
                    <th className="pb-3">Supplier Lead Time</th>
                    <th className="pb-3">Recommended Order</th>
                    <th className="pb-3">Est. Spend</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {recommendations.map((rec) => (
                    <tr key={rec.medicine_id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-white">{rec.medicine_name}</div>
                        <div className="text-[10px] text-slate-400">{rec.category} • {rec.supplier_name}</div>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-slate-200">
                        {rec.current_stock} {rec.unit}
                      </td>
                      <td className="py-3.5 font-mono text-cyan-300">
                        {rec.forecast_demand_period} {rec.unit}
                      </td>
                      <td className="py-3.5 font-mono text-slate-400">
                        {rec.safety_stock} {rec.unit}
                      </td>
                      <td className="py-3.5 font-mono">
                        {rec.lead_time_days} days
                      </td>
                      <td className="py-3.5 font-mono font-extrabold text-sm">
                        {rec.recommended_quantity > 0 ? (
                          <span className="text-cyan-400">{rec.recommended_quantity} {rec.unit}</span>
                        ) : (
                          <span className="text-slate-500 font-normal">Sufficient</span>
                        )}
                      </td>
                      <td className="py-3.5 font-mono text-slate-300">
                        ₹{rec.estimated_cost.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityBadge(rec.priority)}`}>
                          {rec.priority}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setExplainModalData({
                              medicine_name: rec.medicine_name,
                              summary: `Procurement recommendation: Order ${rec.recommended_quantity} ${rec.unit} from ${rec.supplier_name}.`,
                              reasons: rec.explainable_reasons,
                              formula_breakdown: rec.formula_breakdown
                            })}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400"
                            title="Inspect AI Formula"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {rec.recommended_quantity > 0 ? (
                            <button
                              onClick={() => setSelectedOrderModal(rec)}
                              className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-bold shadow-glow-cyan transition-all flex items-center gap-1"
                            >
                              <span>Create PO</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Optimal</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Active Purchase Orders Tab */
        <div className="rounded-2xl glass-panel border border-slate-800 p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Active Purchase Orders & Inbound Shipments</h3>
              <p className="text-xs text-slate-400">Track PO dispatch, vendor delivery confirmations, and receipt ingestion</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">PO Number</th>
                  <th className="pb-3">Medication</th>
                  <th className="pb-3">Supplier</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Expected Delivery</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {orders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-cyan-300">{po.po_number}</td>
                    <td className="py-3 font-semibold text-white">{po.medicine_name}</td>
                    <td className="py-3 text-slate-300">{po.supplier_name}</td>
                    <td className="py-3 font-mono font-bold">{po.quantity}</td>
                    <td className="py-3 font-mono text-emerald-400">₹{po.total_amount.toLocaleString()}</td>
                    <td className="py-3 font-mono text-slate-300">{po.expected_delivery_date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        po.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        po.status === 'IN_TRANSIT' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {po.status !== 'DELIVERED' && (
                        <button
                          onClick={() => handleDeliverPO(po.id)}
                          className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-colors"
                        >
                          Receive Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExplainabilityModal
        isOpen={Boolean(explainModalData)}
        onClose={() => setExplainModalData(null)}
        data={explainModalData}
      />

      <CreateOrderModal
        isOpen={Boolean(selectedOrderModal)}
        onClose={() => setSelectedOrderModal(null)}
        recommendation={selectedOrderModal}
        onSuccess={() => {
          loadData();
          setActiveTab('orders');
        }}
      />
    </div>
  );
}
