import React from 'react';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  AlertOctagon, 
  Zap, 
  Clock, 
  Building2, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Layers,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { 
  Product, 
  Supplier, 
  PurchaseOrder, 
  SalesTransaction, 
  InventoryTransaction, 
  AIAnalysisResult 
} from '../types';

interface DashboardViewProps {
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  sales: SalesTransaction[];
  inventoryTransactions: InventoryTransaction[];
  aiAnalysis: AIAnalysisResult;
  onNavigateTab: (tab: any) => void;
  onQuickReorder: (product: Product) => void;
  onRefreshAi: () => void;
  isAiRefreshing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  suppliers,
  purchaseOrders,
  sales,
  inventoryTransactions,
  aiAnalysis,
  onNavigateTab,
  onQuickReorder,
  onRefreshAi,
  isAiRefreshing,
}) => {
  // Aggregate KPI metrics
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((acc, p) => acc + p.currentStock * p.unitPrice, 0);
  const lowStockItems = products.filter((p) => p.status === 'Low Stock').length;
  const criticalStockItems = products.filter((p) => p.status === 'Critical').length;
  const outOfStockItems = products.filter((p) => p.status === 'Out of Stock').length;
  const healthyStockItems = products.filter((p) => p.status === 'Healthy').length;
  const fastMovingItems = products.filter((p) => p.velocityClass === 'Fast Moving').length;
  const slowMovingItems = products.filter((p) => p.velocityClass === 'Slow Moving').length;
  const totalSuppliers = suppliers.length;
  const pendingOrders = purchaseOrders.filter((p) => p.status === 'Pending' || p.status === 'Draft' || p.status === 'Ordered').length;
  const stockoutRiskCount = products.filter((p) => p.stockoutRisk === 'CRITICAL' || p.stockoutRisk === 'HIGH').length;

  // Category breakdown
  const categoryMap = new Map<string, { count: number; value: number }>();
  products.forEach((p) => {
    const cur = categoryMap.get(p.category) || { count: 0, value: 0 };
    categoryMap.set(p.category, {
      count: cur.count + 1,
      value: cur.value + p.currentStock * p.unitPrice,
    });
  });
  const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    value: data.value,
  }));

  // Daily Sales trend (grouped by date)
  const salesByDateMap = new Map<string, { units: number; revenue: number }>();
  sales.forEach((s) => {
    const cur = salesByDateMap.get(s.date) || { units: 0, revenue: 0 };
    salesByDateMap.set(s.date, {
      units: cur.units + s.quantity,
      revenue: cur.revenue + s.totalPrice,
    });
  });
  const salesTrend = Array.from(salesByDateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7); // Last 7 active sales days

  const maxDailyRevenue = Math.max(1, ...salesTrend.map((d) => d[1].revenue));

  // Inventory Flow trend: Restock vs Outflow
  const inventoryFlowByDate = new Map<string, { inQty: number; outQty: number }>();
  inventoryTransactions.forEach((tx) => {
    const cur = inventoryFlowByDate.get(tx.date) || { inQty: 0, outQty: 0 };
    if (tx.quantity > 0) cur.inQty += tx.quantity;
    else cur.outQty += Math.abs(tx.quantity);
    inventoryFlowByDate.set(tx.date, cur);
  });
  const inventoryFlowTrend = Array.from(inventoryFlowByDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  // Stockout Risk distribution
  const riskCounts = {
    CRITICAL: products.filter((p) => p.stockoutRisk === 'CRITICAL').length,
    HIGH: products.filter((p) => p.stockoutRisk === 'HIGH').length,
    MEDIUM: products.filter((p) => p.stockoutRisk === 'MEDIUM').length,
    LOW: products.filter((p) => p.stockoutRisk === 'LOW').length,
  };

  // PO status distribution
  const poStatusMap: Record<string, { count: number; total: number }> = {
    Draft: { count: 0, total: 0 },
    Pending: { count: 0, total: 0 },
    Approved: { count: 0, total: 0 },
    Ordered: { count: 0, total: 0 },
    Shipped: { count: 0, total: 0 },
    Delivered: { count: 0, total: 0 },
    Cancelled: { count: 0, total: 0 },
  };
  purchaseOrders.forEach((po) => {
    if (poStatusMap[po.status]) {
      poStatusMap[po.status].count += 1;
      poStatusMap[po.status].total += po.totalAmount;
    }
  });

  // Critical alerts list for table
  const urgentProducts = products
    .filter((p) => p.status === 'Critical' || p.status === 'Out of Stock')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Health & Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-900/50 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                AI Supply Chain Engine
              </span>
              <span className="text-xs text-slate-400">
                Health Score: <strong className="text-emerald-400 font-bold">{aiAnalysis.inventoryHealthScore}/100</strong>
              </span>
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight">
              Inventory & Supplier Intelligence Overview
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
              {aiAnalysis.summary}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRefreshAi}
              disabled={isAiRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAiRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isAiRefreshing ? 'Auditing...' : 'Run AI Audit'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('reorder_center')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Reorder Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Highlighted Alerts Pill Row */}
        {aiAnalysis.criticalAlerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2.5">
            {aiAnalysis.criticalAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-rose-950/40 text-rose-300 border border-rose-900/50"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {/* Total Products */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Products</span>
            <Package className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{totalProducts}</div>
          <div className="text-[11px] text-slate-400 mt-1">{categories.length} categories</div>
        </div>

        {/* Inventory Value */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Inventory Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Capital in warehouse</div>
        </div>

        {/* Critical Stock */}
        <div 
          onClick={() => onNavigateTab('stockout_risk')}
          className="bg-slate-900 border border-rose-900/40 hover:border-rose-700/60 p-4 rounded-xl transition cursor-pointer group bg-gradient-to-br from-rose-950/20 to-slate-900"
        >
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-medium">Critical Stock</span>
            <AlertOctagon className="w-4 h-4 text-rose-400 group-hover:scale-110 transition animate-pulse" />
          </div>
          <div className="text-xl font-bold text-rose-400 tracking-tight">{criticalStockItems}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">
            {outOfStockItems > 0 ? `+${outOfStockItems} out of stock` : 'Breached safety stock'}
          </div>
        </div>

        {/* Low Stock Items */}
        <div 
          onClick={() => onNavigateTab('reorder_center')}
          className="bg-slate-900 border border-amber-900/40 hover:border-amber-700/60 p-4 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs font-medium">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">{lowStockItems}</div>
          <div className="text-[11px] text-amber-300/80 mt-1">At or below ROP</div>
        </div>

        {/* Stockout Risk Items */}
        <div 
          onClick={() => onNavigateTab('stockout_risk')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Stock-out Risks</span>
            <ShieldAlert className="w-4 h-4 text-orange-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-orange-400 tracking-tight">{stockoutRiskCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Coverage &le; Lead Time</div>
        </div>

        {/* Fast Moving */}
        <div 
          onClick={() => onNavigateTab('fast_moving')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Fast Moving</span>
            <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-cyan-400 tracking-tight">{fastMovingItems}</div>
          <div className="text-[11px] text-slate-400 mt-1">&ge; 5.5 units / day</div>
        </div>

        {/* Slow Moving */}
        <div 
          onClick={() => onNavigateTab('fast_moving')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Slow Moving</span>
            <Clock className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-indigo-300 tracking-tight">{slowMovingItems}</div>
          <div className="text-[11px] text-slate-400 mt-1">&lt; 2.0 units / day</div>
        </div>

        {/* Total Suppliers */}
        <div 
          onClick={() => onNavigateTab('suppliers')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Suppliers</span>
            <Building2 className="w-4 h-4 text-violet-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{totalSuppliers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Contracted vendors</div>
        </div>

        {/* Pending POs */}
        <div 
          onClick={() => onNavigateTab('purchase_orders')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending POs</span>
            <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">{pendingOrders}</div>
          <div className="text-[11px] text-slate-400 mt-1">In fulfillment cycle</div>
        </div>

        {/* Healthy Stock */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Healthy Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            {healthyStockItems}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Above safety stock</div>
        </div>
      </div>

      {/* Visual Analytics Grid 1: Sales Revenue Trend & Inventory Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Daily Sales Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Recent Sales Revenue & Volume Trend
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Aggregated daily revenue from real customer point-of-sale transactions
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Live POS Feed
            </span>
          </div>

          <div className="pt-2">
            <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-slate-800">
              {salesTrend.map(([date, data]) => {
                const heightPct = Math.max(12, Math.round((data.revenue / maxDailyRevenue) * 100));
                const dayLabel = date.slice(5);

                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      ${Math.round(data.revenue)}
                    </div>
                    <div
                      className="w-full max-w-[34px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                      title={`${date}: ${data.units} units sold ($${data.revenue.toFixed(2)})`}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-2.5">
              <span>7-day recorded sales volume: <strong className="text-white">{salesTrend.reduce((a, b) => a + b[1].units, 0)} units</strong></span>
              <span>Total revenue: <strong className="text-emerald-400">${salesTrend.reduce((a, b) => a + b[1].revenue, 0).toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Chart B: Inventory Flow (Restock vs Outflow) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Warehouse Stock Movement (Inflow vs Outflow)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Physical unit movements recorded in historical inventory transactions
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Restock In
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Sales Out
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {inventoryFlowTrend.map(([date, flow]) => {
              const maxFlow = Math.max(flow.inQty, flow.outQty, 1);
              return (
                <div key={date} className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span className="font-mono">{date}</span>
                    <span className="space-x-3">
                      <span className="text-emerald-400">+{flow.inQty} in</span>
                      <span className="text-rose-400">-{flow.outQty} out</span>
                    </span>
                  </div>
                  <div className="flex gap-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (flow.inQty / (flow.inQty + flow.outQty || 1)) * 100)}%` }}
                    />
                    <div
                      className="bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, (flow.outQty / (flow.inQty + flow.outQty || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid 2: Category Breakdown & Demand Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Inventory Value & Count by Category */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" />
              Inventory Breakdown by Category
            </h3>
            <span className="text-xs text-slate-400">Valuation &amp; Share</span>
          </div>

          <div className="space-y-3.5">
            {categories.map((cat) => {
              const pct = totalInventoryValue > 0 ? (cat.value / totalInventoryValue) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{cat.name} ({cat.count} items)</span>
                    <span className="font-semibold text-white">
                      ${cat.value.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Fast-Moving vs Slow-Moving Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Sales Velocity Classification
              </h3>
              <span className="text-xs text-slate-400">Demand Turnover Rate</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60 text-center">
                <div className="text-xs text-cyan-400 font-semibold mb-1">Fast Moving</div>
                <div className="text-lg font-bold text-white">{fastMovingItems}</div>
                <div className="text-[10px] text-slate-400">&ge; 5.5 units/day</div>
              </div>

              <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60 text-center">
                <div className="text-xs text-indigo-400 font-semibold mb-1">Medium Moving</div>
                <div className="text-lg font-bold text-white">
                  {products.filter((p) => p.velocityClass === 'Medium Moving').length}
                </div>
                <div className="text-[10px] text-slate-400">2.0 - 5.4 units/day</div>
              </div>

              <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60 text-center">
                <div className="text-xs text-amber-400 font-semibold mb-1">Slow Moving</div>
                <div className="text-lg font-bold text-white">{slowMovingItems}</div>
                <div className="text-[10px] text-slate-400">&lt; 2.0 units/day</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              💡 <strong>AI Strategy:</strong> Fast-moving items require aggressive buffer stocks to absorb unexpected supply disruptions. Slow-moving items should have limited purchase order quantities to minimize capital carrying costs.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => onNavigateTab('fast_moving')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
            >
              <span>Explore Velocity Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid 3: Stockout Risk Meter & Purchase Order Lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stockout Risk Gauge */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Stock-out Risk Distribution (Coverage vs Lead Time)
            </h3>
            <span className="text-xs text-slate-400">All {totalProducts} Products</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl">
              <span className="text-rose-400 font-bold block text-base">{riskCounts.CRITICAL}</span>
              <span className="text-[10px] text-rose-300">CRITICAL</span>
            </div>
            <div className="p-3 bg-orange-950/30 border border-orange-900/40 rounded-xl">
              <span className="text-orange-400 font-bold block text-base">{riskCounts.HIGH}</span>
              <span className="text-[10px] text-orange-300">HIGH</span>
            </div>
            <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl">
              <span className="text-amber-400 font-bold block text-base">{riskCounts.MEDIUM}</span>
              <span className="text-[10px] text-amber-300">MEDIUM</span>
            </div>
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl">
              <span className="text-emerald-400 font-bold block text-base">{riskCounts.LOW}</span>
              <span className="text-[10px] text-emerald-300">LOW</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 pt-1">
            <div className="flex justify-between text-[11px]">
              <span>Critical &amp; High Vulnerability:</span>
              <span className="font-bold text-rose-400">
                {(((riskCounts.CRITICAL + riskCounts.HIGH) / Math.max(1, totalProducts)) * 100).toFixed(1)}% of Catalog
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div style={{ width: `${(riskCounts.CRITICAL / totalProducts) * 100}%` }} className="bg-rose-500" />
              <div style={{ width: `${(riskCounts.HIGH / totalProducts) * 100}%` }} className="bg-orange-500" />
              <div style={{ width: `${(riskCounts.MEDIUM / totalProducts) * 100}%` }} className="bg-amber-500" />
              <div style={{ width: `${(riskCounts.LOW / totalProducts) * 100}%` }} className="bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* PO Status Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              Purchase Order Lifecycle Status
            </h3>
            <span className="text-xs text-slate-400">Total: {purchaseOrders.length} POs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {Object.entries(poStatusMap).map(([status, val]) => (
              <div key={status} className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{status}</div>
                <div className="text-sm font-bold text-white mt-0.5">{val.count} orders</div>
                <div className="text-[10px] text-slate-400 mt-0.5">${val.total.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Stock-Out Risks & Reorder Action Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Critical Stock & Immediate Reorder Required
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Products with stock below safety threshold or estimated days to depletion under supplier lead time.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('reorder_center')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All ({criticalStockItems + lowStockItems})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No critical stock items at present. All inventory is operating above safety points.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Current Stock</th>
                  <th className="py-2.5 px-3">Reorder Point</th>
                  <th className="py-2.5 px-3">Days Remaining</th>
                  <th className="py-2.5 px-3">Lead Time</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {urgentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.id} • {p.supplierName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{p.category}</td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${p.currentStock === 0 ? 'text-rose-500' : 'text-rose-400'}`}>
                        {p.currentStock} units
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">{p.reorderPoint} units</td>
                    <td className="py-3 px-3 text-amber-400 font-semibold">{p.daysRemaining} days</td>
                    <td className="py-3 px-3 text-slate-300">{p.leadTime} days</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {p.stockoutRisk}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onQuickReorder(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
                      >
                        Create Draft PO ({p.recommendedOrderQty} qty)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supplier & Purchase Order Quick Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-400" />
              Top Recommended Suppliers
            </h3>
            <button
              onClick={() => onNavigateTab('supplier_comparison')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Compare All
            </button>
          </div>

          <div className="space-y-3">
            {suppliers.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800"
              >
                <div>
                  <div className="text-xs font-bold text-white">{s.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Lead Time: {s.averageDeliveryTime}d • On-Time: {s.onTimeDeliveryRate}% • Quality: {s.qualityRating}/5.0
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    s.status === 'Preferred' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Recent Purchase Orders
            </h3>
            <button
              onClick={() => onNavigateTab('purchase_orders')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View Orders
            </button>
          </div>

          <div className="space-y-3">
            {purchaseOrders.slice(0, 4).map((po) => (
              <div
                key={po.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{po.poNumber}</span>
                    {po.createdFromAlert && (
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                        Auto Draft
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{po.supplierName} • {po.orderDate}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-200">${po.totalAmount.toFixed(2)}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    po.status === 'Delivered'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : po.status === 'Ordered' || po.status === 'Shipped'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {po.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
