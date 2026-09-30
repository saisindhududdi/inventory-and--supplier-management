import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Sparkles, 
  Sliders, 
  Award, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Star, 
  Percent, 
  ArrowRight, 
  ShieldCheck, 
  RotateCcw,
  Building2,
  TrendingUp,
  Info
} from 'lucide-react';
import { Supplier, SupplierWeightConfig, Product } from '../types';
import { evaluateSupplier, DEFAULT_WEIGHTS } from '../services/reorderEngine';

interface SupplierComparisonViewProps {
  suppliers: Supplier[];
  products: Product[];
  onSelectSupplierForPO: (supplier: Supplier) => void;
}

export const SupplierComparisonView: React.FC<SupplierComparisonViewProps> = ({
  suppliers,
  products,
  onSelectSupplierForPO,
}) => {
  const [weights, setWeights] = useState<SupplierWeightConfig>(DEFAULT_WEIGHTS);
  const [searchQuery, setSearchQuery] = useState('');

  // Compute evaluations for all suppliers using multi-criteria normalization
  const evaluatedSuppliers = useMemo(() => {
    return suppliers.map((s) => {
      const evaluation = evaluateSupplier(s, weights, suppliers);
      return {
        ...s,
        overallScore: evaluation.overallScore,
        scoreBreakdown: evaluation.breakdown,
        recommendationExplanation: evaluation.recommendationExplanation,
      };
    }).sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
  }, [suppliers, weights]);

  const topSupplier = evaluatedSuppliers[0];

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return evaluatedSuppliers;
    const q = searchQuery.toLowerCase();
    return evaluatedSuppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q)
    );
  }, [evaluatedSuppliers, searchQuery]);

  const resetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          AI Supplier Recommender & Decision Engine
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Multi-criteria decision analysis (MCDA) transparent scoring system: Price (25%), Delivery Time (20%), Reliability (20%), Quality (15%), and Fulfillment Rate (20%).
        </p>
      </div>

      {/* Top AI Recommended Supplier Showcase Banner */}
      {topSupplier && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Award className="w-48 h-48 text-indigo-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  #1 AI Recommended Supplier
                </span>
                <span className="text-xs text-slate-300">
                  Overall Composite Score: <strong className="text-emerald-400 text-sm font-extrabold">{topSupplier.overallScore} / 100</strong>
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight">
                {topSupplier.name}
              </h3>

              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recommendation Rationale:</span>
                </div>
                <p className="leading-relaxed text-slate-200">
                  {topSupplier.recommendationExplanation}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                  💰 Price Score: <strong className="text-emerald-400">{topSupplier.scoreBreakdown?.priceScore}/100</strong>
                </span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                  ⚡ Delivery Score: <strong className="text-cyan-400">{topSupplier.scoreBreakdown?.deliveryScore}/100</strong>
                </span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                  🎯 Reliability Score: <strong className="text-indigo-400">{topSupplier.scoreBreakdown?.reliabilityScore}/100</strong>
                </span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                  ⭐ Quality Score: <strong className="text-amber-400">{topSupplier.scoreBreakdown?.qualityScore}/100</strong>
                </span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                  📦 Fulfillment Score: <strong className="text-violet-400">{topSupplier.scoreBreakdown?.fulfillmentScore}/100</strong>
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-2">
              <button
                onClick={() => onSelectSupplierForPO(topSupplier)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Generate Draft PO with Top Supplier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weight Sliders Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Transparent Scoring Model & Weight Allocations
            </h3>
          </div>
          <button
            onClick={resetWeights}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Standard Weights</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          The engine normalizes all raw metric values (0-100) before computing the weighted overall score. Standard allocation: Price (25%), Delivery Time (20%), Reliability (20%), Quality (15%), Fulfillment (20%).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          {/* Price Weight */}
          <div className="space-y-1.5 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Price (25%)</span>
              <span className="font-bold text-emerald-400">{(weights.priceWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.priceWeight}
              onChange={(e) => setWeights({ ...weights, priceWeight: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Delivery Time Weight */}
          <div className="space-y-1.5 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Delivery Time (20%)</span>
              <span className="font-bold text-cyan-400">{(weights.deliveryWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.deliveryWeight}
              onChange={(e) => setWeights({ ...weights, deliveryWeight: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Reliability Weight */}
          <div className="space-y-1.5 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Reliability (20%)</span>
              <span className="font-bold text-indigo-400">{(weights.reliabilityWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.reliabilityWeight}
              onChange={(e) => setWeights({ ...weights, reliabilityWeight: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Quality Weight */}
          <div className="space-y-1.5 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Quality (15%)</span>
              <span className="font-bold text-amber-400">{(weights.qualityWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.qualityWeight}
              onChange={(e) => setWeights({ ...weights, qualityWeight: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Fulfillment Weight */}
          <div className="space-y-1.5 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Fulfillment Rate (20%)</span>
              <span className="font-bold text-violet-400">{(weights.fulfillmentWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.fulfillmentWeight}
              onChange={(e) => setWeights({ ...weights, fulfillmentWeight: parseFloat(e.target.value) })}
              className="w-full accent-violet-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Supplier Comparison Table displaying the EXACT 8 Required Attributes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Supplier Evaluation & Normalized Scoring Matrix</span>
              <span className="text-xs text-indigo-400 font-normal">
                (Evaluated & Ranked by Overall Score)
              </span>
            </h3>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3.5 px-3 text-center">Rank</th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-3 text-center">Price Score (25%)</th>
                <th className="py-3.5 px-3 text-center">Delivery Score (20%)</th>
                <th className="py-3.5 px-3 text-center">Reliability Score (20%)</th>
                <th className="py-3.5 px-3 text-center">Quality Score (15%)</th>
                <th className="py-3.5 px-3 text-center">Fulfillment Score (20%)</th>
                <th className="py-3.5 px-3 text-center">Overall Score</th>
                <th className="py-3.5 px-4 min-w-[280px]">Recommendation Reason</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSuppliers.map((s, index) => {
                const isWinner = index === 0;

                return (
                  <tr 
                    key={s.id} 
                    className={`hover:bg-slate-800/40 transition ${
                      isWinner ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3 text-center font-bold">
                      {isWinner ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/30">
                          1
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">{index + 1}</span>
                      )}
                    </td>

                    {/* 1. Supplier Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{s.name}</span>
                        {isWinner && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            Top Pick
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {s.id} • {s.contactPerson} • {s.phone}
                      </div>
                    </td>

                    {/* 2. Price Score */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="font-bold text-emerald-400 text-xs">
                        {s.scoreBreakdown?.priceScore}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.unitPriceIndex}x benchmark
                      </div>
                    </td>

                    {/* 3. Delivery Score */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="font-bold text-cyan-400 text-xs">
                        {s.scoreBreakdown?.deliveryScore}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.averageDeliveryTime} days lead
                      </div>
                    </td>

                    {/* 4. Reliability Score */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="font-bold text-indigo-300 text-xs">
                        {s.scoreBreakdown?.reliabilityScore}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.onTimeDeliveryRate}% on-time
                      </div>
                    </td>

                    {/* 5. Quality Score */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="font-bold text-amber-400 text-xs">
                        {s.scoreBreakdown?.qualityScore}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.qualityRating}/5.0 • {s.returnRate}% ret
                      </div>
                    </td>

                    {/* 6. Fulfillment Score */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="font-bold text-violet-400 text-xs">
                        {s.scoreBreakdown?.fulfillmentScore}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.fulfillmentRate}% rate
                      </div>
                    </td>

                    {/* 7. Overall Score */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-sm font-extrabold px-2.5 py-1 rounded-lg border ${
                          isWinner
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : (s.overallScore || 0) >= 80
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {s.overallScore}
                      </span>
                    </td>

                    {/* 8. Recommendation Reason */}
                    <td className="py-3.5 px-4 text-slate-200 text-xs leading-relaxed">
                      {s.recommendationExplanation}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectSupplierForPO(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                          isWinner
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        Select for PO
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
