import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3,
  CheckCircle2, 
  Truck, 
  Clock, 
  X, 
  DollarSign, 
  Calendar, 
  Building2, 
  Printer, 
  Ban, 
  FileCheck 
} from 'lucide-react';
import { PurchaseOrder, POStatus, Supplier, Product } from '../types';

interface PurchaseOrdersViewProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  onCreatePO: (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => void;
  onUpdatePO: (po: PurchaseOrder) => void;
  onUpdateStatus: (poId: string, newStatus: POStatus) => void;
  onCancelPO: (poId: string) => void;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({
  purchaseOrders,
  suppliers,
  products,
  onCreatePO,
  onUpdatePO,
  onUpdateStatus,
  onCancelPO,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  // Edit PO Form state
  const [editQuantity, setEditQuantity] = useState<number>(10);
  const [editUnitPrice, setEditUnitPrice] = useState<number>(0);
  const [editExpectedDate, setEditExpectedDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(30);
  const [expectedDays, setExpectedDays] = useState(4);
  const [notes, setNotes] = useState('Standard replenishment order.');

  const openEditModal = (po: PurchaseOrder) => {
    setEditingPO(po);
    const primaryItem = po.items[0];
    setEditQuantity(primaryItem ? primaryItem.quantity : 10);
    setEditUnitPrice(primaryItem ? primaryItem.unitPrice : 0);
    setEditExpectedDate(po.expectedDelivery);
    setEditNotes(po.notes || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPO) return;

    const updatedItems = editingPO.items.map((item, idx) => {
      if (idx === 0) {
        return {
          ...item,
          quantity: editQuantity,
          unitPrice: editUnitPrice,
          totalPrice: Number((editQuantity * editUnitPrice).toFixed(2)),
        };
      }
      return item;
    });

    const newTotal = updatedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

    onUpdatePO({
      ...editingPO,
      items: updatedItems,
      totalAmount: Number(newTotal.toFixed(2)),
      expectedDelivery: editExpectedDate,
      notes: editNotes,
    });

    setEditingPO(null);
  };

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesStatus = selectedStatus === 'All' || po.status === selectedStatus;
    const matchesSearch =
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      po.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const prod = products.find((p) => p.id === selectedProductId) || products[0];

    // Compute unit price factoring supplier price index
    const unitPrice = Number((prod.unitPrice * (sup.unitPriceIndex || 1.0)).toFixed(2));
    const totalPrice = Number((unitPrice * quantity).toFixed(2));

    const today = new Date();
    const expected = new Date(today);
    expected.setDate(today.getDate() + (expectedDays || sup.averageDeliveryTime || 4));

    onCreatePO({
      supplierId: sup.id,
      supplierName: sup.name,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity,
          unitPrice,
          totalPrice,
        },
      ],
      totalAmount: totalPrice,
      orderDate: today.toISOString().split('T')[0],
      expectedDelivery: expected.toISOString().split('T')[0],
      status: 'Pending',
      notes,
    });

    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status: POStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Shipped':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Ordered':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Approved':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Draft':
        return 'bg-slate-700 text-slate-300 border-slate-600';
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            Purchase Order Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, track, and approve replenishment purchase orders. Marking an order "Delivered" automatically updates catalog stock balances.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New PO</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO number, supplier, or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer w-full md:w-44"
          >
            <option value="All">Status: All</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Ordered">Ordered</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-4">Ordered Line Items</th>
                <th className="py-3 px-3 text-right">Total Value</th>
                <th className="py-3 px-3 text-center">Order Date</th>
                <th className="py-3 px-3 text-center">Est. Delivery</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions & Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No purchase orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => {
                  return (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition">
                      {/* PO Number */}
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{po.poNumber}</span>
                          {po.createdFromAlert && (
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                              AI Draft
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-3 text-slate-200 font-medium">
                        {po.supplierName}
                      </td>

                      {/* Line Items */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {po.items.map((item, idx) => (
                            <div key={idx} className="text-white font-medium">
                              <span>{item.quantity}x {item.productName}</span>
                              <span className="text-slate-400 ml-1.5 text-[10px]">
                                (${item.unitPrice.toFixed(2)}/unit)
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Value */}
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        ${po.totalAmount.toFixed(2)}
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-3 text-center text-slate-300">
                        {po.orderDate}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300">
                        {po.expectedDelivery}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(po.status)}`}>
                          {po.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingPO(po)}
                            title="View Invoice Preview"
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {po.status !== 'Delivered' && po.status !== 'Cancelled' && (
                            <button
                              onClick={() => openEditModal(po)}
                              title="Edit Purchase Order"
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded-lg transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Lifecycle Status Buttons */}
                          {po.status === 'Draft' && (
                            <button
                              onClick={() => onUpdateStatus(po.id, 'Pending')}
                              className="px-2 py-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              Submit
                            </button>
                          )}

                          {po.status === 'Pending' && (
                            <button
                              onClick={() => onUpdateStatus(po.id, 'Approved')}
                              className="px-2 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              Approve
                            </button>
                          )}

                          {po.status === 'Approved' && (
                            <button
                              onClick={() => onUpdateStatus(po.id, 'Ordered')}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-medium transition cursor-pointer"
                            >
                              Place Order
                            </button>
                          )}

                          {po.status === 'Ordered' && (
                            <button
                              onClick={() => onUpdateStatus(po.id, 'Shipped')}
                              className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-medium transition cursor-pointer flex items-center gap-1"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Shipped</span>
                            </button>
                          )}

                          {po.status === 'Shipped' && (
                            <button
                              onClick={() => onUpdateStatus(po.id, 'Delivered')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Receive &amp; Restock</span>
                            </button>
                          )}

                          {po.status !== 'Delivered' && po.status !== 'Cancelled' && (
                            <button
                              onClick={() => onCancelPO(po.id)}
                              title="Cancel PO"
                              className="p-1.5 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* PO Invoice View / Print Modal */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
                  Official Purchase Order
                </span>
                <h3 className="text-xl font-bold text-white">{viewingPO.poNumber}</h3>
                <div className="text-xs text-slate-400 mt-0.5">Order Date: {viewingPO.orderDate}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(viewingPO.status)}`}>
                  {viewingPO.status}
                </span>
                <button
                  onClick={() => setViewingPO(null)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Vendor & Delivery Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] font-semibold uppercase">Vendor Supplier</span>
                <div className="font-bold text-white mt-0.5">{viewingPO.supplierName}</div>
                <div className="text-slate-400 text-[11px]">ID: {viewingPO.supplierId}</div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] font-semibold uppercase">Expected Delivery</span>
                <div className="font-bold text-cyan-300 mt-0.5">{viewingPO.expectedDelivery}</div>
                <div className="text-slate-400 text-[11px]">Destination: Main Fulfillment Hub</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Itemized Order List
              </h4>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 text-[10px] font-semibold uppercase">
                    <tr>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3 text-center">Quantity</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {viewingPO.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-medium text-white">{item.productName}</td>
                        <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          ${item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-800/80 font-bold border-t border-slate-700">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 text-right text-slate-300">
                        Total Order Amount:
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 text-sm">
                        ${viewingPO.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            {viewingPO.notes && (
              <div className="text-xs text-slate-400 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                <strong className="text-slate-300">Notes / Instructions:</strong> {viewingPO.notes}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Order</span>
              </button>

              <button
                onClick={() => setViewingPO(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit PO Modal */}
      {editingPO && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Edit Purchase Order</h3>
                <span className="text-xs text-indigo-400 font-mono">{editingPO.poNumber} • {editingPO.supplierName}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingPO(null)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Item Being Ordered</label>
                <div className="p-2.5 bg-slate-800 rounded-xl text-white font-semibold">
                  {editingPO.items[0]?.productName || 'General Line Item'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Order Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Negotiated Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(parseFloat(e.target.value) || 0.1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Recalculated Total:</span>
                <span className="text-sm font-bold text-emerald-400">
                  ${(editQuantity * editUnitPrice).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Expected Delivery Date *</label>
                <input
                  type="date"
                  required
                  value={editExpectedDate}
                  onChange={(e) => setEditExpectedDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Order Notes / Delivery Terms</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Shipping instructions, dock number..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingPO(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                Save PO Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Create PO Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Purchase Order</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.averageDeliveryTime}d lead time • {s.onTimeDeliveryRate}% on-time)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.currentStock}, Unit Price: ${p.unitPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Order Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Expected Lead Days *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expectedDays}
                    onChange={(e) => setExpectedDays(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Shipping instructions, dock number..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                Submit Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
