import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Award,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState(null);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const viewDetails = async (s) => {
    setSelectedSupplier(s);
    try {
      const details = await api.getSupplierDetails(s.id);
      setSupplierDetails(details);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-cyan-400" />
            <span>Supplier Performance & Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Vendor delivery reliability index, lead time compliance, quality compliance metrics, and active procurement pipelines
          </p>
        </div>
      </div>

      {/* Supplier Scorecards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-slate-400 text-xs">
            Loading supplier intelligence scorecards...
          </div>
        ) : (
          suppliers.map((s) => (
            <div
              key={s.id}
              onClick={() => viewDetails(s)}
              className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{s.contact_person || 'Logistics Desk'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  s.delay_risk === 'HIGH' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                  s.delay_risk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {s.delay_risk} Delay Risk
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
                <div>
                  <span className="text-[11px] text-slate-400">Avg Lead Time</span>
                  <div className="text-lg font-mono font-bold text-white">{s.average_lead_time} days</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Reliability Score</span>
                  <div className="text-lg font-mono font-bold text-teal-300">{s.reliability_score}%</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Items Supplied</span>
                  <div className="text-sm font-mono font-semibold text-slate-200">{s.items_supplied_count} items</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Active Orders</span>
                  <div className="text-sm font-mono font-semibold text-cyan-400">{s.pending_orders_count} orders</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-cyan-400 font-medium">
                <span>View Performance Record</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedSupplier.name}</h3>
                <p className="text-xs text-slate-400">Verified Healthcare Vendor Profile</p>
              </div>
              <button
                onClick={() => { setSelectedSupplier(null); setSupplierDetails(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Avg Lead Time</span>
                  <div className="text-base font-mono font-bold text-white">{selectedSupplier.average_lead_time} days</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Fulfillment Reliability</span>
                  <div className="text-base font-mono font-bold text-emerald-400">{selectedSupplier.reliability_score}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Quality Compliance</span>
                  <div className="text-base font-mono font-bold text-cyan-300">{selectedSupplier.quality_compliance}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Vendor Rating</span>
                  <div className="text-base font-mono font-bold text-amber-300">★ {selectedSupplier.rating} / 5.0</div>
                </div>
              </div>

              {supplierDetails?.supplied_medicines && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-300 mb-2">Contracted Medications</h4>
                  <div className="space-y-1.5">
                    {supplierDetails.supplied_medicines.map(m => (
                      <div key={m.id} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex justify-between text-xs">
                        <span className="font-semibold text-white">{m.name}</span>
                        <span className="text-slate-400">{m.category} • ₹{m.unit_cost}/unit</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => { setSelectedSupplier(null); setSupplierDetails(null); }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
