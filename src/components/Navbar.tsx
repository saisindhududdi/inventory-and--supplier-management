import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  RotateCcw, 
  Package, 
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  criticalCount: number;
  lowStockCount: number;
  outOfStockCount?: number;
  onResetData: () => void;
  onOpenCollegeHub: () => void;
  isAiActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  criticalCount,
  lowStockCount,
  outOfStockCount = 0,
  onResetData,
  onOpenCollegeHub,
  isAiActive,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base lg:text-lg tracking-tight text-white flex items-center gap-1.5">
              Nexus<span className="text-indigo-400 font-extrabold">Inventory</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">
                AI Edition
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Intelligent Inventory & Supplier Management System
          </p>
        </div>
      </div>

      {/* Center status indicators */}
      <div className="hidden md:flex items-center gap-2.5">
        {(criticalCount > 0 || outOfStockCount > 0) ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>
              {criticalCount} Critical Stock
              {outOfStockCount > 0 ? ` (${outOfStockCount} Out of Stock)` : ''}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stock Levels Healthy</span>
          </div>
        )}

        {lowStockCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span>{lowStockCount} Items at Reorder Point</span>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        {/* AI Engine Status pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Engine:</span>
          <span className="text-cyan-300 font-semibold">{isAiActive ? 'Gemini 3.8 Flash' : 'Rule Engine Active'}</span>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={onResetData}
          title="Reset to default initial sample dataset"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* College Project Hub Button */}
        <button
          onClick={onOpenCollegeHub}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/25 transition cursor-pointer"
        >
          <GraduationCap className="w-4 h-4" />
          <span className="hidden xs:inline">Mini Project Hub</span>
        </button>
      </div>
    </header>
  );
};
