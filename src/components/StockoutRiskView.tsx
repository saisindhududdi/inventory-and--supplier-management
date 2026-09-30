import React, { useState } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Search, 
  TrendingDown, 
  Calendar, 
  Building2,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Product, Supplier } from '../types';

interface StockoutRiskViewProps {
  products: Product[];
  suppliers: Supplier[];
  onQuickReorder: (product: Product) => void;
}

export const StockoutRiskView: React.FC<StockoutRiskViewProps> = ({
  products,
  suppliers,
  onQuickReorder,
}) => {
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [search, setSearch] = useState('');

  // Counts
  const criticalCount = products.filter((p) => p.stockoutRisk === 'CRITICAL').length;
  const highCount = products.filter((p) => p.stockoutRisk === 'HIGH').length;
  const mediumCount = products.filter((p) => p.stockoutRisk === 'MEDIUM').length;
  const lowCount = products.filter((p) => p.stockoutRisk === 'LOW').length;

  const filtered = products.filter((p) => {
    const matchesRisk = selectedRisk === 'All' || p.stockoutRisk === selectedRisk;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-500" />
          Stock-Out Risk Predictive Matrix
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Dynamic lead-time comparison: Evaluates whether remaining stock coverage can sustain customer demand until replenishment shipments arrive.
        </p>
      </div>

      {/* 4 Risk Tier Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CRITICAL */}
        <div 
          onClick={() => setSelectedRisk(selectedRisk === 'CRITICAL' ? 'All' : 'CRITICAL')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedRisk === 'CRITICAL'
              ? 'bg-rose-950/60 border-rose-500 shadow-lg shadow-rose-500/20'
              : 'bg-slate-900 border-rose-900/40 hover:border-rose-700/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400">CRITICAL RISK</span>
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-white">{criticalCount} Products</div>
          <p className="text-[11px] text-rose-300/80 mt-1">Days Remaining &le; Lead Time</p>
        </div>

        {/* HIGH */}
        <div 
          onClick={() => setSelectedRisk(selectedRisk === 'HIGH' ? 'All' : 'HIGH')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedRisk === 'HIGH'
              ? 'bg-orange-950/60 border-orange-500 shadow-lg shadow-orange-500/20'
              : 'bg-slate-900 border-orange-900/40 hover:border-orange-700/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-400">HIGH RISK</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{highCount} Products</div>
          <p className="text-[11px] text-orange-300/80 mt-1">Coverage &le; 1.5x Lead Time</p>
        </div>

        {/* MEDIUM */}
        <div 
          onClick={() => setSelectedRisk(selectedRisk === 'MEDIUM' ? 'All' : 'MEDIUM')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedRisk === 'MEDIUM'
              ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 border-amber-900/40 hover:border-amber-700/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400">MEDIUM RISK</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{mediumCount} Products</div>
          <p className="text-[11px] text-amber-300/80 mt-1">Coverage &le; 2.5x Lead Time</p>
        </div>

        {/* LOW */}
        <div 
          onClick={() => setSelectedRisk(selectedRisk === 'LOW' ? 'All' : 'LOW')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            selectedRisk === 'LOW'
              ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 border-emerald-900/40 hover:border-emerald-700/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400">LOW RISK</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{lowCount} Products</div>
          <p className="text-[11px] text-emerald-300/80 mt-1">Safe coverage cushion</p>
        </div>
      </div>

      {/* Predictive Logic Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white">Stock-Out Condition Rule:</span>
            <span className="text-slate-300 ml-1.5 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              IF (Days Remaining &le; Supplier Lead Time) ➔ CRITICAL (Inventory reaches zero before delivery arrival)
            </span>
          </div>
        </div>

        {selectedRisk !== 'All' && (
          <button
            onClick={() => setSelectedRisk('All')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            Show All Risks
          </button>
        )}
      </div>

      {/* Predictive Risk Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search risk items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Filtered: <strong>{filtered.length}</strong> items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-3 text-right">Current Stock</th>
                <th className="py-3 px-3 text-center">Daily Sales</th>
                <th className="py-3 px-3 text-center">Stock Days Left</th>
                <th className="py-3 px-3 text-center">Supplier Lead Time</th>
                <th className="py-3 px-3 text-center">Risk Level</th>
                <th className="py-3 px-4">AI Prediction & Explanatory Reasoning</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p) => {
                const daysLeft = p.daysRemaining || 0;
                const leadTime = p.leadTime;
                const isCritical = p.stockoutRisk === 'CRITICAL';
                const isHigh = p.stockoutRisk === 'HIGH';

                let explanation = '';
                if (p.currentStock === 0) {
                  explanation = 'Out of stock! Revenue and customer goodwill are being lost every day.';
                } else if (daysLeft <= leadTime) {
                  explanation = `Inventory will reach ZERO in ${daysLeft} days, but vendor delivery requires ${leadTime} days. Stock-out is mathematically guaranteed unless order is expedited.`;
                } else if (daysLeft <= leadTime * 1.5) {
                  explanation = `Narrow buffer of ${daysLeft} days coverage against ${leadTime} days delivery time. Vulnerable to any delivery delay or sales surge.`;
                } else if (daysLeft <= leadTime * 2.5) {
                  explanation = `Moderate coverage (${daysLeft} days). Stock is sufficient for current lead cycle (${leadTime} days), but nearing reorder threshold.`;
                } else {
                  explanation = `Healthy coverage of ${daysLeft} days well exceeds supplier lead time of ${leadTime} days.`;
                }

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.id} • {p.supplierName}</div>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-200">
                      {p.currentStock} units
                    </td>

                    <td className="py-3 px-3 text-center text-slate-300">
                      {p.averageDailySales} /day
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold ${
                        daysLeft <= leadTime
                          ? 'text-rose-400'
                          : daysLeft <= leadTime * 1.5
                          ? 'text-orange-400'
                          : 'text-slate-300'
                      }`}>
                        {daysLeft} days
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-medium text-slate-300">
                      {leadTime} days
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : isHigh
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : p.stockoutRisk === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {p.stockoutRisk}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {explanation}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onQuickReorder(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isCritical || isHigh
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        Reorder Now
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
