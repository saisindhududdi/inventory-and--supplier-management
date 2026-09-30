import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  TrendingUp, 
  RotateCw, 
  AlertOctagon, 
  Building2, 
  Scale, 
  ShoppingBag, 
  Bot, 
  FileText, 
  GraduationCap
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'inventory'
  | 'fast_moving'
  | 'reorder_center'
  | 'stockout_risk'
  | 'suppliers'
  | 'supplier_comparison'
  | 'purchase_orders'
  | 'ai_assistant'
  | 'reports'
  | 'college_hub';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  reorderAlertsCount: number;
  criticalRiskCount: number;
  pendingPoCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  reorderAlertsCount,
  criticalRiskCount,
  pendingPoCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inventory' as NavTab,
      label: 'Inventory Catalog',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'fast_moving' as NavTab,
      label: 'Velocity & Fast-Moving',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'reorder_center' as NavTab,
      label: 'AI Reorder Engine',
      icon: RotateCw,
      badge: reorderAlertsCount > 0 ? reorderAlertsCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'stockout_risk' as NavTab,
      label: 'Stock-out Risk Predictor',
      icon: AlertOctagon,
      badge: criticalRiskCount > 0 ? criticalRiskCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'suppliers' as NavTab,
      label: 'Supplier Management',
      icon: Building2,
      badge: null,
    },
    {
      id: 'supplier_comparison' as NavTab,
      label: 'AI Supplier Recommender',
      icon: Scale,
      badge: null,
    },
    {
      id: 'purchase_orders' as NavTab,
      label: 'Purchase Orders',
      icon: ShoppingBag,
      badge: pendingPoCount > 0 ? pendingPoCount : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      id: 'ai_assistant' as NavTab,
      label: 'AI Inventory Assistant',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold',
    },
    {
      id: 'reports' as NavTab,
      label: 'Analytics & Reports',
      icon: FileText,
      badge: null,
    },
    {
      id: 'college_hub' as NavTab,
      label: 'College Mini Project Hub',
      icon: GraduationCap,
      badge: 'VIVA',
      badgeColor: 'bg-violet-500/30 text-violet-300 border-violet-500/50 font-bold',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto">
      {/* Navigation List */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>

        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Procurement & Sourcing
        </div>

        {navItems.slice(5, 8).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Intelligence & Governance
        </div>

        {navItems.slice(8).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* College Project Viva Quick Note */}
      <div className="mt-auto p-3 m-3 rounded-xl bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-900/40 text-slate-300">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
          <span>College Mini Project</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Includes full Python / Flask / SQLite codebase, viva prep guide & system architecture.
        </p>
      </div>
    </aside>
  );
};
