import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Percent, 
  Star,
  X,
  Package,
  ArrowRight
} from 'lucide-react';
import { Supplier, SupplierStatus } from '../types';

interface SuppliersViewProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onNavigateToComparison: () => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onNavigateToComparison,
}) => {
  const [search, setSearch] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    productsSupplied: 'Electronics, Peripherals',
    unitPriceIndex: 1.0,
    averageDeliveryTime: 4,
    onTimeDeliveryRate: 95,
    qualityRating: 4.5,
    fulfillmentRate: 96,
    returnRate: 1.5,
    minOrderQuantity: 15,
    status: 'Active' as SupplierStatus,
  });

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      productsSupplied: 'Accessories, Peripherals',
      unitPriceIndex: 1.0,
      averageDeliveryTime: 4,
      onTimeDeliveryRate: 94,
      qualityRating: 4.5,
      fulfillmentRate: 95,
      returnRate: 1.5,
      minOrderQuantity: 15,
      status: 'Active',
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      contactPerson: s.contactPerson,
      email: s.email,
      phone: s.phone,
      address: s.address,
      productsSupplied: s.productsSupplied.join(', '),
      unitPriceIndex: s.unitPriceIndex,
      averageDeliveryTime: s.averageDeliveryTime,
      onTimeDeliveryRate: s.onTimeDeliveryRate,
      qualityRating: s.qualityRating,
      fulfillmentRate: s.fulfillmentRate,
      returnRate: s.returnRate,
      minOrderQuantity: s.minOrderQuantity,
      status: s.status,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productsArray = formData.productsSupplied.split(',').map((item) => item.trim()).filter(Boolean);

    if (editingSupplier) {
      onUpdateSupplier({
        ...editingSupplier,
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        productsSupplied: productsArray,
        unitPriceIndex: Number(formData.unitPriceIndex),
        averageDeliveryTime: Number(formData.averageDeliveryTime),
        onTimeDeliveryRate: Number(formData.onTimeDeliveryRate),
        qualityRating: Number(formData.qualityRating),
        fulfillmentRate: Number(formData.fulfillmentRate),
        returnRate: Number(formData.returnRate),
        minOrderQuantity: Number(formData.minOrderQuantity),
        status: formData.status,
      });
    } else {
      onAddSupplier({
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        productsSupplied: productsArray,
        unitPriceIndex: Number(formData.unitPriceIndex),
        averageDeliveryTime: Number(formData.averageDeliveryTime),
        onTimeDeliveryRate: Number(formData.onTimeDeliveryRate),
        qualityRating: Number(formData.qualityRating),
        fulfillmentRate: Number(formData.fulfillmentRate),
        returnRate: Number(formData.returnRate),
        minOrderQuantity: Number(formData.minOrderQuantity),
        status: formData.status,
      });
    }

    setIsAddEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-400" />
            Supplier Relationship Management (SRM)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor vendor performance metrics: on-time reliability, average delivery lead times, defect return rates, and fulfillment ratios.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToComparison}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <span>Compare &amp; Rank</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, contact, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing <strong>{filtered.length}</strong> active vendors
        </span>
      </div>

      {/* Supplier Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    {s.id}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{s.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{s.contactPerson}</div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  s.status === 'Preferred'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : s.status === 'Active'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {s.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{s.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{s.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{s.address}</span>
                </div>
              </div>

              {/* Performance Metrics Matrix */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400">On-Time Delivery</span>
                  <div className="font-bold text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{s.onTimeDeliveryRate}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400">Avg Lead Time</span>
                  <div className="font-bold text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{s.averageDeliveryTime} days</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400">Quality Rating</span>
                  <div className="font-bold text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{s.qualityRating} / 5.0</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400">Return Rate</span>
                  <div className={`font-bold flex items-center gap-1 ${
                    s.returnRate > 3 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    <Percent className="w-3 h-3" />
                    <span>{s.returnRate}%</span>
                  </div>
                </div>
              </div>

              {/* Products Supplied Pills */}
              <div className="flex flex-wrap gap-1">
                {s.productsSupplied.slice(0, 3).map((prod, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                  >
                    {prod}
                  </span>
                ))}
                {s.productsSupplied.length > 3 && (
                  <span className="text-[10px] text-slate-400 px-1 py-0.5">
                    +{s.productsSupplied.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">
                MOQ: <strong>{s.minOrderQuantity} units</strong> • Price: <strong>{s.unitPriceIndex}x</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(s)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                  title="Edit Supplier"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete supplier ${s.name}?`)) {
                      onDeleteSupplier(s.id);
                    }
                  }}
                  className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                  title="Delete Supplier"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Supplier Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingSupplier ? 'Edit Supplier Profile' : 'Add New Supplier'}
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
                <label className="block text-slate-300 font-medium mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Apex Global Components"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Preferred">Preferred</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Address / Warehouse Hub</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="City, State / Region"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Products Supplied (comma-separated)</label>
                <input
                  type="text"
                  value={formData.productsSupplied}
                  onChange={(e) => setFormData({ ...formData, productsSupplied: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Avg Lead Time (days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.averageDeliveryTime}
                    onChange={(e) => setFormData({ ...formData, averageDeliveryTime: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">On-Time %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.onTimeDeliveryRate}
                    onChange={(e) => setFormData({ ...formData, onTimeDeliveryRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quality (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={formData.qualityRating}
                    onChange={(e) => setFormData({ ...formData, qualityRating: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Price Index (1.0 = std)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="2.0"
                    required
                    value={formData.unitPriceIndex}
                    onChange={(e) => setFormData({ ...formData, unitPriceIndex: parseFloat(e.target.value) || 1.0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Fulfillment %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.fulfillmentRate}
                    onChange={(e) => setFormData({ ...formData, fulfillmentRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Return Defect %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    required
                    value={formData.returnRate}
                    onChange={(e) => setFormData({ ...formData, returnRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
