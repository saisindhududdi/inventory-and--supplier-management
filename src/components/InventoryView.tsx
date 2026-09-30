import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Package,
  Layers,
  Calendar,
  Building2,
  DollarSign
} from 'lucide-react';
import { Product, Supplier, StockStatus } from '../types';

interface InventoryViewProps {
  products: Product[];
  suppliers: Supplier[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onQuickReorder: (product: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  suppliers,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onQuickReorder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'velocity' | 'risk'>('stock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Peripherals',
    description: '',
    currentStock: 20,
    unitPrice: 29.99,
    averageDailySales: 4.5,
    leadTime: 4,
    safetyStock: 12,
    supplierId: suppliers[0]?.id || '',
    lastRestocked: new Date().toISOString().split('T')[0],
  });

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') comp = a.name.localeCompare(b.name);
        else if (sortBy === 'stock') comp = a.currentStock - b.currentStock;
        else if (sortBy === 'price') comp = a.unitPrice - b.unitPrice;
        else if (sortBy === 'velocity') comp = (a.salesVelocity || 0) - (b.salesVelocity || 0);
        else if (sortBy === 'risk') {
          const riskRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          comp = (riskRank[a.stockoutRisk || 'LOW'] || 0) - (riskRank[b.stockoutRisk || 'LOW'] || 0);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Peripherals',
      description: '',
      currentStock: 25,
      unitPrice: 35.0,
      averageDailySales: 5.0,
      leadTime: 4,
      safetyStock: 12,
      supplierId: suppliers[0]?.id || '',
      lastRestocked: new Date().toISOString().split('T')[0],
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      description: p.description,
      currentStock: p.currentStock,
      unitPrice: p.unitPrice,
      averageDailySales: p.averageDailySales,
      leadTime: p.leadTime,
      safetyStock: p.safetyStock,
      supplierId: p.supplierId,
      lastRestocked: p.lastRestocked,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplierObj = suppliers.find((s) => s.id === formData.supplierId);
    const supplierName = supplierObj?.name || 'Standard Vendor';

    // Calculate Reorder Point = (ADS * LeadTime) + SafetyStock
    const reorderPoint = Math.ceil(formData.averageDailySales * formData.leadTime + formData.safetyStock);

    let status: StockStatus = 'Healthy';
    if (formData.currentStock <= 0) status = 'Out of Stock';
    else if (formData.currentStock <= formData.safetyStock || formData.currentStock <= reorderPoint * 0.45)
      status = 'Critical';
    else if (formData.currentStock <= reorderPoint) status = 'Low Stock';

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        currentStock: Number(formData.currentStock),
        unitPrice: Number(formData.unitPrice),
        averageDailySales: Number(formData.averageDailySales),
        leadTime: Number(formData.leadTime),
        safetyStock: Number(formData.safetyStock),
        reorderPoint,
        supplierId: formData.supplierId,
        supplierName,
        lastRestocked: formData.lastRestocked,
        status,
      });
    } else {
      onAddProduct({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        currentStock: Number(formData.currentStock),
        unitPrice: Number(formData.unitPrice),
        averageDailySales: Number(formData.averageDailySales),
        leadTime: Number(formData.leadTime),
        safetyStock: Number(formData.safetyStock),
        reorderPoint,
        supplierId: formData.supplierId,
        supplierName,
        lastRestocked: formData.lastRestocked,
        status,
      });
    }

    setIsAddEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            Inventory Catalog Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time stock balances, dynamic Reorder Points (ROP), daily sales velocities, and lead times.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name, ID, category, or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer w-full md:w-44"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer w-full md:w-40"
            >
              <option value="All">Status: All</option>
              <option value="Healthy">Healthy Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer w-full md:w-36"
            >
              <option value="stock">Sort: Stock</option>
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
              <option value="velocity">Sort: Velocity</option>
              <option value="risk">Sort: Risk</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Currently sorted ${sortOrder.toUpperCase()}`}
              className="px-2.5 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl text-xs text-slate-300 font-semibold cursor-pointer"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Showing <strong>{filteredProducts.length}</strong> of {products.length} products</span>
          <span className="text-slate-600">•</span>
          <button 
            onClick={() => { setSelectedCategory('All'); setSelectedStatus('All'); setSearchQuery(''); }}
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Current Stock</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-center">Velocity</th>
                <th className="py-3 px-3 text-center">ROP (Lead + Safety)</th>
                <th className="py-3 px-3 text-center">Stock Status</th>
                <th className="py-3 px-3 text-center">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No products found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      {/* Product Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">{p.id}</span>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{p.supplierName}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {p.category}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 text-right">
                        <div className={`font-bold ${
                          p.currentStock === 0
                            ? 'text-rose-500'
                            : p.status === 'Critical'
                            ? 'text-rose-400'
                            : p.status === 'Low Stock'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}>
                          {p.currentStock} units
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ~{p.daysRemaining} days left
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3 px-3 text-right font-medium text-slate-200">
                        ${p.unitPrice.toFixed(2)}
                      </td>

                      {/* Sales Velocity */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-semibold text-white">{p.salesVelocity} /day</div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                          p.velocityClass === 'Fast Moving'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : p.velocityClass === 'Medium Moving'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {p.velocityClass}
                        </span>
                      </td>

                      {/* ROP */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-semibold text-slate-200">{p.reorderPoint} units</div>
                        <div className="text-[10px] text-slate-400">
                          Lead: {p.leadTime}d • Safe: {p.safetyStock}
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'Healthy'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'Low Stock'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : p.status === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Risk Level */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
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

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status !== 'Healthy' && (
                            <button
                              onClick={() => onQuickReorder(p)}
                              title="Generate Draft Purchase Order"
                              className="px-2 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-[11px] font-medium transition cursor-pointer"
                            >
                              Reorder
                            </button>
                          )}
                          <button
                            onClick={() => setViewingProduct(p)}
                            title="View Calculation Details"
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            title="Delete Product"
                            className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Details Modal (Educational Formula Breakdown) */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  {viewingProduct.id} • {viewingProduct.category}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{viewingProduct.name}</h3>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              {viewingProduct.description}
            </p>

            {/* Calculations Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Automated Inventory Formulas & Calculations
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Reorder Point (ROP)</div>
                  <div className="text-sm font-bold text-indigo-400 mt-1">
                    {viewingProduct.reorderPoint} units
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Formula: (ADS × LeadTime) + SafetyStock<br />
                    ({viewingProduct.averageDailySales} × {viewingProduct.leadTime}) + {viewingProduct.safetyStock} = {viewingProduct.reorderPoint}
                  </div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Stock Coverage Days</div>
                  <div className="text-sm font-bold text-cyan-400 mt-1">
                    {viewingProduct.daysRemaining} days remaining
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Formula: CurrentStock / ADS<br />
                    {viewingProduct.currentStock} / {viewingProduct.averageDailySales} = {viewingProduct.daysRemaining} days
                  </div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Stock-out Risk Comparison</div>
                  <div className="text-sm font-bold text-rose-400 mt-1">
                    Risk: {viewingProduct.stockoutRisk}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Supplier Lead Time: <strong>{viewingProduct.leadTime} days</strong><br />
                    Days Remaining: <strong>{viewingProduct.daysRemaining} days</strong>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Recommended Reorder Qty</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {viewingProduct.recommendedOrderQty} units
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Accounts for 14-day replenishment cycle and supplier minimum order threshold.
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Meta */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400">Designated Supplier:</span>
                <div className="font-bold text-white">{viewingProduct.supplierName}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Last Restocked:</span>
                <div className="font-medium text-slate-300">{viewingProduct.lastRestocked}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Close
              </button>
              {viewingProduct.status !== 'Healthy' && (
                <button
                  onClick={() => {
                    const p = viewingProduct;
                    setViewingProduct(null);
                    onQuickReorder(p);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  Create Draft Purchase Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Ergonomic Bluetooth Mouse"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Peripherals">Peripherals</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Storage">Storage</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Office Supplies">Office Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Product specification details..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Avg Daily Sales *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.averageDailySales}
                    onChange={(e) => setFormData({ ...formData, averageDailySales: parseFloat(e.target.value) || 0.1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lead Time (days) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.leadTime}
                    onChange={(e) => setFormData({ ...formData, leadTime: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Safety Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.safetyStock}
                    onChange={(e) => setFormData({ ...formData, safetyStock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assigned Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Last Restocked Date</label>
                <input
                  type="date"
                  value={formData.lastRestocked}
                  onChange={(e) => setFormData({ ...formData, lastRestocked: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
