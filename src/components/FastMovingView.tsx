import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  BarChart3, 
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Product } from '../types';

interface FastMovingViewProps {
  products: Product[];
  onQuickReorder: (product: Product) => void;
}

export const FastMovingView: React.FC<FastMovingViewProps> = ({
  products,
  onQuickReorder,
}) => {
  const [filterClass, setFilterClass] = useState<'All' | 'Fast Moving' | 'Medium Moving' | 'Slow Moving'>('All');
  const [search, setSearch] = useState('');

  // Classifications
  const fastMovers = products.filter((p) => p.velocityClass === 'Fast Moving');
  const mediumMovers = products.filter((p) => p.velocityClass === 'Medium Moving');
  const slowMovers = products.filter((p) => p.velocityClass === 'Slow Moving');

  const filtered = products.filter((p) => {
    const matchesClass = filterClass === 'All' || p.velocityClass === filterClass;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Fast-Moving & Demand Velocity Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Evaluate daily sales velocity (Units / Day) to identify fast-moving revenue drivers versus sluggish capital-draining inventory.
        </p>
      </div>

      {/* 3 Summary Classification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fast Moving */}
        <div 
          onClick={() => setFilterClass(filterClass === 'Fast Moving' ? 'All' : 'Fast Moving')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            filterClass === 'Fast Moving'
              ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Fast Moving
            </span>
            <span className="text-xs text-slate-400">&ge; 5.5 units/day</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{fastMovers.length} Products</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            High turnover rate. Highest stock-out vulnerability during sales surges.
          </p>
          <div className="mt-3 text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
            <span>Filter fast-movers</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Medium Moving */}
        <div 
          onClick={() => setFilterClass(filterClass === 'Medium Moving' ? 'All' : 'Medium Moving')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            filterClass === 'Medium Moving'
              ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Medium Moving
            </span>
            <span className="text-xs text-slate-400">2.0 - 5.4 units/day</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{mediumMovers.length} Products</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Steady predictable demand. Maintain standard reorder frequency.
          </p>
          <div className="mt-3 text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
            <span>Filter medium-movers</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Slow Moving */}
        <div 
          onClick={() => setFilterClass(filterClass === 'Slow Moving' ? 'All' : 'Slow Moving')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            filterClass === 'Slow Moving'
              ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Slow Moving
            </span>
            <span className="text-xs text-slate-400">&lt; 2.0 units/day</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{slowMovers.length} Products</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Sluggish capital turnover. Consider discount bundling to free shelf space.
          </p>
          <div className="mt-3 text-[11px] font-semibold text-amber-400 flex items-center gap-1">
            <span>Filter slow-movers</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Formula & Policy Insight Callout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white">Velocity Computation Model:</span>
            <span className="text-slate-300 ml-1.5 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Daily Velocity = Total Units Sold (14-day window) / 14 Days
            </span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Automatically refreshed whenever point-of-sale transactions or audit records are registered.
            </p>
          </div>
        </div>

        {filterClass !== 'All' && (
          <button
            onClick={() => setFilterClass('All')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium shrink-0 cursor-pointer"
          >
            Clear Class Filter ({filterClass})
          </button>
        )}
      </div>

      {/* Search and Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search velocity products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Showing {filtered.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Daily Velocity</th>
                <th className="py-2.5 px-3 text-center">Classification</th>
                <th className="py-2.5 px-3 text-right">Current Stock</th>
                <th className="py-2.5 px-3 text-center">Stock Remaining</th>
                <th className="py-2.5 px-3 text-center">Stock-out Risk</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.id} • {p.supplierName}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{p.category}</td>
                  <td className="py-3 px-3 text-center font-bold text-white">
                    {p.salesVelocity} <span className="text-[10px] text-slate-400 font-normal">units/day</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.velocityClass === 'Fast Moving'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : p.velocityClass === 'Medium Moving'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.velocityClass}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-200">
                    {p.currentStock} units
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`font-semibold ${
                      (p.daysRemaining || 0) <= p.leadTime
                        ? 'text-rose-400'
                        : (p.daysRemaining || 0) <= 7
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}>
                      {p.daysRemaining} days
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      p.stockoutRisk === 'CRITICAL'
                        ? 'text-rose-400 bg-rose-500/10'
                        : p.stockoutRisk === 'HIGH'
                        ? 'text-orange-400 bg-orange-500/10'
                        : p.stockoutRisk === 'MEDIUM'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {p.stockoutRisk}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onQuickReorder(p)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      Reorder ({p.recommendedOrderQty})
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
