import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Truck, Calendar, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function CreateOrderModal({ isOpen, onClose, recommendation, onSuccess }) {
  if (!isOpen || !recommendation) return null;

  const [quantity, setQuantity] = useState(recommendation.recommended_quantity || 100);
  const [priority, setPriority] = useState(recommendation.priority || 'URGENT');
  const [supplierId, setSupplierId] = useState(recommendation.supplier_id || 1);
  const [suppliers, setSuppliers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setQuantity(recommendation.recommended_quantity || 100);
    setPriority(recommendation.priority || 'URGENT');
    if (recommendation.supplier_id) setSupplierId(recommendation.supplier_id);
    
    api.getSuppliers().then(setSuppliers).catch(console.error);
  }, [recommendation]);

  const selectedSupplier = suppliers.find(s => s.id === Number(supplierId)) || {
    name: recommendation.supplier_name || 'MedSupply Corp',
    average_lead_time: recommendation.lead_time_days || 5,
    reliability_score: 94.0
  };

  const unitCost = recommendation.unit_cost || 50;
  const totalCost = quantity * unitCost;

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (selectedSupplier.average_lead_time || 5));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        medicine_id: recommendation.medicine_id,
        supplier_id: Number(supplierId),
        quantity: Number(quantity),
        priority: priority,
        notes: `PO generated via Medora Smart Procurement for ${recommendation.medicine_name}.`
      };

      const res = await api.createPurchaseOrder(payload);
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to generate purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-cyan-500/30 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate Purchase Order</h3>
              <p className="text-xs text-slate-400">{recommendation.medicine_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Order Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Order Quantity ({recommendation.unit || 'Units'})
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
              required
            />
            <span className="text-[11px] text-cyan-400/80 mt-1 block">
              AI Recommended replenishment: {recommendation.recommended_quantity} {recommendation.unit}
            </span>
          </div>

          {/* Supplier Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fulfillment Supplier
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (Lead: {s.average_lead_time}d | Rel: {s.reliability_score}%)
                </option>
              ))}
            </select>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Logistics Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="URGENT">URGENT (Expedited Air Cargo)</option>
              <option value="HIGH">HIGH (Priority Ground Dispatch)</option>
              <option value="NORMAL">NORMAL (Scheduled Distribution)</option>
            </select>
          </div>

          {/* Cost & Delivery Summary Box */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Unit Cost:</span>
              <span className="font-mono text-slate-200">₹{unitCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Delivery:</span>
              <span className="font-mono text-cyan-300">{deliveryDate.toLocaleDateString()} ({selectedSupplier.average_lead_time} days)</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
              <span>Total Invoice Amount:</span>
              <span className="font-mono text-emerald-400">₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-glow-cyan transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming PO...' : 'Confirm & Dispatch PO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
