import React, { useState } from 'react';
import { 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingCart, 
  HelpCircle, 
  ArrowRight,
  Calculator,
  ShieldCheck,
  Zap,
  Info,
  Building2,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { Product, Supplier } from '../types';

interface ReorderCenterViewProps {
  products: Product[];
  suppliers: Supplier[];
  onGenerateDraftPO: (product: Product, quantity?: number) => void;
  onBatchReorderCritical: () => void;
}

export const ReorderCenterView: React.FC<ReorderCenterViewProps> = ({
  products,
  suppliers,
  onGenerateDraftPO,
  onBatchReorderCritical,
}) => {
  const [filterType, setFilterType] = useState<'All' | 'Reorder Required' | 'Critical' | 'Low Stock' | 'Healthy'>('Reorder Required');
  const [searchQuery, setSearchQuery] = useState('');

  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

  // Breakdown of products strictly matching status classifications
  const criticalItems = products.filter((p) => p.status === 'Critical' || p.status === 'Out of Stock');
  const lowStockItems = products.filter((p) => p.status === 'Low Stock');
  const reorderRequiredItems = products.filter(
    (p) => p.status === 'Critical' || p.status === 'Out of Stock' || p.status === 'Low Stock'
  );
  const healthyItems = products.filter((p) => p.status === 'Healthy');

  let filtered = products;
  if (filterType === 'Reorder Required') filtered = reorderRequiredItems;
  else if (filterType === 'Critical') filtered = criticalItems;
  else if (filterType === 'Low Stock') filtered = lowStockItems;
  else if (filterType === 'Healthy') filtered = healthyItems;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Helper to build a comprehensive, academic reason for reorder
  const getReorderReason = (p: Product, supplier?: Supplier) => {
    const supName = supplier?.name || p.supplierName;
    const isOut = p.status === 'Out of Stock';
    const isCrit = p.status === 'Critical';
    const isLow = p.status === 'Low Stock';

    if (isOut) {
      return `Critical stock-out (0 units on hand). Immediate replenishment of ${p.recommendedOrderQty} units required via ${supName} (${p.leadTime}-day delivery) to resume customer sales.`;
    }
    if (isCrit) {
      return `Current stock (${p.currentStock} units) has breached safety threshold (${p.safetyStock} units). Only ${p.daysRemaining} days remaining vs ${p.leadTime}-day lead time. Recommended ${supName} for high fulfillment reliability.`;
    }
    if (isLow) {
      return `Stock (${p.currentStock} units) is below Reorder Point (${p.reorderPoint} units). Order ${p.recommendedOrderQty} units from ${supName} to maintain a 14-day replenishment cycle and prevent future stockouts.`;
    }
    return `Stock level (${p.currentStock} units, ${p.daysRemaining} days coverage) is currently adequate above ROP (${p.reorderPoint} units). Scheduled replenishment with ${supName}.`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-indigo-400" />
            AI Reorder Engine & Replenishment Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time replenishment calculations based on Daily Demand Velocity, Supplier Lead Times, and Safety Stock thresholds.
          </p>
        </div>

        {criticalItems.length > 0 && (
          <button
            onClick={onBatchReorderCritical}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Generate Draft POs for All ({criticalItems.length}) Critical Items</span>
          </button>
        )}
      </div>

      {/* Mathematical Model Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Reorder Point & Economic Replenishment Mathematical Model
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Formula Verified
              </span>
            </div>
            <div className="inline-block font-mono text-xs bg-slate-800/90 text-indigo-300 px-3 py-1.5 rounded-lg border border-slate-700">
              Reorder Point (ROP) = (Average Daily Sales × Supplier Lead Time) + Safety Stock
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              When current inventory falls to or below the Reorder Point, the engine recommends an optimized order quantity that satisfies demand across the supplier lead time plus a 14-day replenishment cycle while complying with the supplier's Minimum Order Quantity (MOQ).
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setFilterType('Reorder Required')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'Reorder Required'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Reorder Required ({reorderRequiredItems.length})</span>
          </button>

          <button
            onClick={() => setFilterType('Critical')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'Critical'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Critical / Out of Stock ({criticalItems.length})</span>
          </button>

          <button
            onClick={() => setFilterType('Low Stock')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'Low Stock'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Stock ({lowStockItems.length})</span>
          </button>

          <button
            onClick={() => setFilterType('Healthy')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === 'Healthy'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Healthy ({healthyItems.length})</span>
          </button>

          <button
            onClick={() => setFilterType('All')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer ${
              filterType === 'All'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Products ({products.length})
          </button>
        </div>

        {/* Search input */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search products or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Reorder Recommendation Table: Displays All 11 Required Fields */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-3 text-right">Current Stock</th>
                <th className="py-3.5 px-3 text-center">Avg Daily Sales</th>
                <th className="py-3.5 px-3 text-center">Lead Time</th>
                <th className="py-3.5 px-3 text-center">Safety Stock</th>
                <th className="py-3.5 px-3 text-center">Reorder Point</th>
                <th className="py-3.5 px-3 text-center">Days Remaining</th>
                <th className="py-3.5 px-3 text-center">Recommended Qty</th>
                <th className="py-3.5 px-3 text-center">Stock-out Risk</th>
                <th className="py-3.5 px-4">Recommended Supplier</th>
                <th className="py-3.5 px-4 min-w-[240px]">Reason</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 text-xs">
                    No products found matching the current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const supplier = supplierMap.get(p.supplierId);
                  const isOut = p.status === 'Out of Stock';
                  const isCrit = p.status === 'Critical';
                  const isLow = p.status === 'Low Stock';
                  const reason = getReorderReason(p, supplier);

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition group">
                      {/* 1. Product */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-indigo-300 transition">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.id} • {p.category}
                        </div>
                      </td>

                      {/* 2. Current Stock */}
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            isOut
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-extrabold'
                              : isCrit
                              ? 'bg-rose-500/10 text-rose-400'
                              : isLow
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {p.currentStock} units
                        </span>
                      </td>

                      {/* 3. Average Daily Sales */}
                      <td className="py-3.5 px-3 text-center text-slate-200 font-medium">
                        {p.averageDailySales} /day
                      </td>

                      {/* 4. Lead Time */}
                      <td className="py-3.5 px-3 text-center text-slate-300">
                        {p.leadTime} days
                      </td>

                      {/* 5. Safety Stock */}
                      <td className="py-3.5 px-3 text-center text-slate-300">
                        {p.safetyStock} units
                      </td>

                      {/* 6. Reorder Point */}
                      <td className="py-3.5 px-3 text-center font-bold text-indigo-300">
                        {p.reorderPoint} units
                      </td>

                      {/* 7. Days Remaining */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`font-bold ${
                            (p.daysRemaining || 0) <= p.leadTime
                              ? 'text-rose-400 animate-pulse'
                              : (p.daysRemaining || 0) <= 7
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {p.daysRemaining} days
                        </span>
                      </td>

                      {/* 8. Recommended Quantity */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {p.recommendedOrderQty} units
                        </span>
                      </td>

                      {/* 9. Stock-out Risk */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            p.stockoutRisk === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                              : p.stockoutRisk === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                              : p.stockoutRisk === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {p.stockoutRisk}
                        </span>
                      </td>

                      {/* 10. Recommended Supplier */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{p.supplierName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Lead Time: {supplier?.averageDeliveryTime || p.leadTime}d • On-Time: {supplier?.onTimeDeliveryRate || 95}%
                        </div>
                      </td>

                      {/* 11. Reason */}
                      <td className="py-3.5 px-4 text-slate-300 text-[11px] leading-relaxed">
                        {reason}
                      </td>

                      {/* Action Button: Generate Draft Purchase Order */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onGenerateDraftPO(p, p.recommendedOrderQty)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
                            isOut || isCrit
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                              : isLow
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title={`Generate Draft Purchase Order for ${p.name}`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                          <span>Generate Draft Purchase Order</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
