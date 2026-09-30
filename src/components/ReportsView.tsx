import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Building2, 
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Search,
  Calendar,
  AlertOctagon
} from 'lucide-react';
import { Product, Supplier, PurchaseOrder } from '../types';

interface ReportsViewProps {
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
}

type ReportType = 
  | 'inventory_valuation'
  | 'low_stock'
  | 'critical_stock'
  | 'fast_moving'
  | 'slow_moving'
  | 'stockout_risk'
  | 'supplier_performance'
  | 'purchase_orders';

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  suppliers,
  purchaseOrders,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('inventory_valuation');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Categories and suppliers list for filters
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const supplierNames = useMemo(() => ['All', ...Array.from(new Set(suppliers.map((s) => s.name)))], [suppliers]);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSup = selectedSupplier === 'All' || p.supplierName === selectedSupplier;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSup && matchSearch;
    });
  }, [products, selectedCategory, selectedSupplier, searchQuery]);

  // Filter Purchase orders
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDate = (!startDate || po.orderDate >= startDate) && (!endDate || po.orderDate <= endDate);
      return matchSearch && matchDate;
    });
  }, [purchaseOrders, searchQuery, startDate, endDate]);

  // Filter Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [suppliers, searchQuery]);

  // Generate CSV download
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const filename = `report_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;

    if (selectedReport === 'inventory_valuation') {
      headers = ['Product ID', 'Product Name', 'Category', 'Current Stock', 'Unit Price ($)', 'Total Value ($)', 'Supplier', 'Status'];
      rows = filteredProducts.map((p) => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category,
        p.currentStock.toString(),
        p.unitPrice.toFixed(2),
        (p.currentStock * p.unitPrice).toFixed(2),
        `"${p.supplierName.replace(/"/g, '""')}"`,
        p.status,
      ]);
    } else if (selectedReport === 'low_stock') {
      headers = ['Product ID', 'Product Name', 'Current Stock', 'Reorder Point', 'Safety Stock', 'Lead Time (Days)', 'Supplier', 'Status'];
      rows = filteredProducts
        .filter((p) => p.status === 'Low Stock' || p.status === 'Critical' || p.status === 'Out of Stock')
        .map((p) => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.currentStock.toString(),
          p.reorderPoint.toString(),
          p.safetyStock.toString(),
          p.leadTime.toString(),
          `"${p.supplierName.replace(/"/g, '""')}"`,
          p.status,
        ]);
    } else if (selectedReport === 'critical_stock') {
      headers = ['Product ID', 'Product Name', 'Current Stock', 'Reorder Point', 'Days Coverage', 'Lead Time', 'Stock-out Risk', 'Supplier'];
      rows = filteredProducts
        .filter((p) => p.status === 'Critical' || p.status === 'Out of Stock' || p.stockoutRisk === 'CRITICAL')
        .map((p) => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.currentStock.toString(),
          p.reorderPoint.toString(),
          (p.daysRemaining || 0).toString(),
          p.leadTime.toString(),
          p.stockoutRisk || 'CRITICAL',
          `"${p.supplierName.replace(/"/g, '""')}"`,
        ]);
    } else if (selectedReport === 'fast_moving') {
      headers = ['Product ID', 'Product Name', 'Category', 'Sales Velocity (Units/Day)', 'Current Stock', 'Days Remaining', 'Risk Level'];
      rows = filteredProducts
        .filter((p) => p.velocityClass === 'Fast Moving')
        .map((p) => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.category,
          (p.salesVelocity || 0).toString(),
          p.currentStock.toString(),
          (p.daysRemaining || 0).toString(),
          p.stockoutRisk || 'LOW',
        ]);
    } else if (selectedReport === 'slow_moving') {
      headers = ['Product ID', 'Product Name', 'Daily Sales', 'Current Stock', 'Stock Coverage Days', 'Capital Tied ($)', 'Supplier'];
      rows = filteredProducts
        .filter((p) => p.velocityClass === 'Slow Moving')
        .map((p) => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.averageDailySales.toString(),
          p.currentStock.toString(),
          (p.daysRemaining || 0).toString(),
          (p.currentStock * p.unitPrice).toFixed(2),
          `"${p.supplierName.replace(/"/g, '""')}"`,
        ]);
    } else if (selectedReport === 'stockout_risk') {
      headers = ['Product ID', 'Product Name', 'Stock', 'Days Remaining', 'Lead Time (Days)', 'Risk Tier', 'Supplier'];
      rows = filteredProducts.map((p) => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.currentStock.toString(),
        (p.daysRemaining || 0).toString(),
        p.leadTime.toString(),
        p.stockoutRisk || 'LOW',
        `"${p.supplierName.replace(/"/g, '""')}"`,
      ]);
    } else if (selectedReport === 'supplier_performance') {
      headers = ['Supplier ID', 'Supplier Name', 'On-Time %', 'Lead Time (Days)', 'Quality Rating', 'Fulfillment %', 'Return %', 'Status'];
      rows = filteredSuppliers.map((s) => [
        s.id,
        `"${s.name.replace(/"/g, '""')}"`,
        s.onTimeDeliveryRate.toString(),
        s.averageDeliveryTime.toString(),
        s.qualityRating.toString(),
        s.fulfillmentRate.toString(),
        s.returnRate.toString(),
        s.status,
      ]);
    } else if (selectedReport === 'purchase_orders') {
      headers = ['PO Number', 'Supplier', 'Order Date', 'Expected Delivery', 'Total Amount ($)', 'Status', 'Notes'];
      rows = filteredOrders.map((po) => [
        po.poNumber,
        `"${po.supplierName.replace(/"/g, '""')}"`,
        po.orderDate,
        po.expectedDelivery,
        po.totalAmount.toFixed(2),
        po.status,
        `"${(po.notes || '').replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Analytics &amp; Compliance Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-ready business intelligence reports with parameterized filters, CSV export, and print formatting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 8 Report Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        {[
          { id: 'inventory_valuation', label: 'Inventory Valuation' },
          { id: 'low_stock', label: 'Low Stock Report' },
          { id: 'critical_stock', label: 'Critical Stock Report' },
          { id: 'fast_moving', label: 'Fast-Moving Goods' },
          { id: 'slow_moving', label: 'Slow-Moving / Excess' },
          { id: 'stockout_risk', label: 'Stock-Out Risk Audit' },
          { id: 'supplier_performance', label: 'Supplier Performance' },
          { id: 'purchase_orders', label: 'Purchase Order History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id as ReportType)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer ${
              selectedReport === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comprehensive Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {selectedReport !== 'supplier_performance' && selectedReport !== 'purchase_orders' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Supplier:</span>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none max-w-xs truncate"
              >
                {supplierNames.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {selectedReport === 'purchase_orders' && (
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-white focus:outline-none"
            />
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-white focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Render Selected Report Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
            {selectedReport.replace(/_/g, ' ')}
          </h3>
          <span className="text-[11px] text-slate-400">
            Audit Date: {new Date().toLocaleDateString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          {/* 1. Inventory Valuation */}
          {selectedReport === 'inventory_valuation' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total Valuation</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{p.category}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200">{p.currentStock} units</td>
                    <td className="py-2.5 px-3 text-right text-slate-200">${p.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      ${(p.currentStock * p.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{p.supplierName}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-300">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 2. Low Stock */}
          {selectedReport === 'low_stock' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Stock</th>
                  <th className="py-2.5 px-3 text-center">Reorder Point</th>
                  <th className="py-2.5 px-3 text-center">Safety Stock</th>
                  <th className="py-2.5 px-3 text-center">Lead Time</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts
                  .filter((p) => p.status === 'Low Stock' || p.status === 'Critical' || p.status === 'Out of Stock')
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-400">{p.currentStock} units</td>
                      <td className="py-2.5 px-3 text-center text-slate-200">{p.reorderPoint} units</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{p.safetyStock} units</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{p.leadTime} days</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{p.supplierName}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 3. Critical Stock Report */}
          {selectedReport === 'critical_stock' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3 text-center">Reorder Point</th>
                  <th className="py-2.5 px-3 text-center">Coverage Days</th>
                  <th className="py-2.5 px-3 text-center">Lead Time</th>
                  <th className="py-2.5 px-3 text-center">Stockout Risk</th>
                  <th className="py-2.5 px-3">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts
                  .filter((p) => p.status === 'Critical' || p.status === 'Out of Stock' || p.stockoutRisk === 'CRITICAL')
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-400">{p.currentStock} units</td>
                      <td className="py-2.5 px-3 text-center text-slate-200">{p.reorderPoint} units</td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-400">{p.daysRemaining} days</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{p.leadTime} days</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {p.stockoutRisk}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{p.supplierName}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 4. Fast-Moving */}
          {selectedReport === 'fast_moving' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">Daily Velocity</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3 text-center">Stock Days Left</th>
                  <th className="py-2.5 px-3 text-center">Risk Tier</th>
                  <th className="py-2.5 px-3">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts
                  .filter((p) => p.velocityClass === 'Fast Moving')
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-cyan-400">{p.salesVelocity} /day</td>
                      <td className="py-2.5 px-3 text-right text-slate-200">{p.currentStock} units</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{p.daysRemaining} days</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-300">{p.stockoutRisk}</td>
                      <td className="py-2.5 px-3 text-slate-300">{p.supplierName}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 5. Slow-Moving */}
          {selectedReport === 'slow_moving' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">Daily Demand</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3 text-center">Coverage (Days)</th>
                  <th className="py-2.5 px-3 text-right">Capital Tied</th>
                  <th className="py-2.5 px-3">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts
                  .filter((p) => p.velocityClass === 'Slow Moving')
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-300">{p.averageDailySales} /day</td>
                      <td className="py-2.5 px-3 text-right text-slate-200">{p.currentStock} units</td>
                      <td className="py-2.5 px-3 text-center text-amber-400 font-semibold">{p.daysRemaining} days</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                        ${(p.currentStock * p.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{p.supplierName}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 6. Stock-out Risk */}
          {selectedReport === 'stockout_risk' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3 text-center">Days Remaining</th>
                  <th className="py-2.5 px-3 text-center">Lead Time</th>
                  <th className="py-2.5 px-3 text-center">Risk Tier</th>
                  <th className="py-2.5 px-3">Assigned Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{p.name}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200">{p.currentStock} units</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-200">{p.daysRemaining} days</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">{p.leadTime} days</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {p.stockoutRisk}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{p.supplierName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 7. Supplier Performance */}
          {selectedReport === 'supplier_performance' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3 text-center">Lead Time</th>
                  <th className="py-2.5 px-3 text-center">On-Time %</th>
                  <th className="py-2.5 px-3 text-center">Quality (1-5)</th>
                  <th className="py-2.5 px-3 text-center">Fulfillment %</th>
                  <th className="py-2.5 px-3 text-center">Return %</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{s.name}</td>
                    <td className="py-2.5 px-3 text-center text-slate-200">{s.averageDeliveryTime} days</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-400">{s.onTimeDeliveryRate}%</td>
                    <td className="py-2.5 px-3 text-center text-amber-400">{s.qualityRating}</td>
                    <td className="py-2.5 px-3 text-center text-slate-200">{s.fulfillmentRate}%</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">{s.returnRate}%</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-300">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 8. Purchase Orders */}
          {selectedReport === 'purchase_orders' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">PO Number</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-center">Order Date</th>
                  <th className="py-2.5 px-3 text-center">Delivery Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{po.poNumber}</td>
                    <td className="py-2.5 px-3 text-slate-200">{po.supplierName}</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">{po.orderDate}</td>
                    <td className="py-2.5 px-3 text-center text-slate-300">{po.expectedDelivery}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      ${po.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-300">{po.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
