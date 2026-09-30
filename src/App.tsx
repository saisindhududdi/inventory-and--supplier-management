/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { FastMovingView } from './components/FastMovingView';
import { ReorderCenterView } from './components/ReorderCenterView';
import { StockoutRiskView } from './components/StockoutRiskView';
import { SuppliersView } from './components/SuppliersView';
import { SupplierComparisonView } from './components/SupplierComparisonView';
import { PurchaseOrdersView } from './components/PurchaseOrdersView';
import { AiAssistantView } from './components/AiAssistantView';
import { ReportsView } from './components/ReportsView';
import { CollegeProjectView } from './components/CollegeProjectView';

import { 
  Product, 
  Supplier, 
  PurchaseOrder, 
  SalesTransaction, 
  InventoryTransaction,
  POStatus,
  AIAnalysisResult 
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_SALES, 
  INITIAL_INVENTORY_TRANSACTIONS 
} from './data/initialData';
import { enrichProducts } from './services/reorderEngine';
import { generateLocalRuleBasedAnalysis } from './services/aiService';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexus_inventory_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return enrichProducts(INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_SUPPLIERS);
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('nexus_inventory_suppliers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('nexus_inventory_pos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_PURCHASE_ORDERS;
  });

  const [sales] = useState<SalesTransaction[]>(INITIAL_SALES);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(INITIAL_INVENTORY_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiRefreshing, setIsAiRefreshing] = useState(false);
  const [isAiActive, setIsAiActive] = useState(true);

  // Check backend Gemini availability
  useEffect(() => {
    const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '';
    fetch(`${apiBase}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        setIsAiActive(data?.geminiConfigured ?? false);
      })
      .catch(() => {
        setIsAiActive(false);
      });
  }, []);

  // Sync to local storage for persistence across reloads
  useEffect(() => {
    localStorage.setItem('nexus_inventory_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexus_inventory_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('nexus_inventory_pos', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-enrich products whenever products, sales, or suppliers change
  const enrichedProducts = useMemo(() => {
    return enrichProducts(products, sales, suppliers);
  }, [products, sales, suppliers]);

  // AI Analysis computed on real data
  const aiAnalysis = useMemo(() => {
    return generateLocalRuleBasedAnalysis(enrichedProducts, suppliers, purchaseOrders);
  }, [enrichedProducts, suppliers, purchaseOrders]);

  // Metrics for Navbar & Sidebar badges
  const criticalCount = enrichedProducts.filter((p) => p.status === 'Critical').length;
  const outOfStockCount = enrichedProducts.filter((p) => p.status === 'Out of Stock').length;
  const lowStockCount = enrichedProducts.filter((p) => p.status === 'Low Stock').length;
  const criticalRiskCount = enrichedProducts.filter((p) => p.stockoutRisk === 'CRITICAL').length;
  const pendingPoCount = purchaseOrders.filter((p) => p.status === 'Pending' || p.status === 'Draft').length;

  // Handlers for Products
  const handleAddProduct = (newProdData: Omit<Product, 'id'>) => {
    const newId = `PRD-${Date.now().toString().slice(-4)}`;
    const newProduct: Product = {
      ...newProdData,
      id: newId,
    };
    const updated = [newProduct, ...products];
    setProducts(enrichProducts(updated, sales, suppliers));
    showToast(`Added new product: ${newProduct.name}`);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(enrichProducts(updated, sales, suppliers));
    showToast(`Updated product: ${updatedProduct.name}`);
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updated = products.filter((p) => p.id !== productId);
    setProducts(enrichProducts(updated, sales, suppliers));
    showToast(`Deleted product ${prod?.name || productId}`);
  };

  // Handlers for Suppliers
  const handleAddSupplier = (newSupData: Omit<Supplier, 'id'>) => {
    const newId = `SUP-00${suppliers.length + 1}`;
    const newSup: Supplier = {
      ...newSupData,
      id: newId,
    };
    setSuppliers([...suppliers, newSup]);
    showToast(`Registered new supplier: ${newSup.name}`);
  };

  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(suppliers.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s)));
    showToast(`Updated supplier: ${updatedSupplier.name}`);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== supplierId));
    showToast(`Removed supplier ${supplierId}`);
  };

  // Handlers for Purchase Orders
  const handleCreatePO = (poData: Omit<PurchaseOrder, 'id' | 'poNumber'>) => {
    const count = purchaseOrders.length + 1;
    const poNumber = `PO-2026-${count.toString().padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `PO-${Date.now().toString().slice(-4)}`,
      poNumber,
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    showToast(`Created purchase order ${poNumber} for $${newPO.totalAmount.toFixed(2)}`);
  };

  const handleUpdatePOStatus = (poId: string, newStatus: POStatus) => {
    const targetPO = purchaseOrders.find((p) => p.id === poId);
    if (!targetPO) return;

    // If changing to 'Delivered', automatically restock inventory!
    if (newStatus === 'Delivered' && targetPO.status !== 'Delivered') {
      const restockTransactions: InventoryTransaction[] = [];

      setProducts((prev) => {
        const prodMap = new Map(prev.map((p) => [p.id, { ...p }]));
        targetPO.items.forEach((item) => {
          const p = prodMap.get(item.productId);
          if (p) {
            p.currentStock += item.quantity;
            p.lastRestocked = new Date().toISOString().split('T')[0];
            restockTransactions.push({
              id: `TRX-${Date.now()}-${item.productId.slice(-3)}`,
              productId: p.id,
              productName: p.name,
              type: 'RESTOCK',
              quantity: item.quantity,
              balanceAfter: p.currentStock,
              date: new Date().toISOString().split('T')[0],
              reference: targetPO.poNumber,
            });
          }
        });
        return enrichProducts(Array.from(prodMap.values()), sales, suppliers);
      });

      setInventoryTransactions((prev) => [...restockTransactions, ...prev]);
      showToast(`PO ${targetPO.poNumber} Delivered! Restocked items added to catalog inventory.`);
    } else {
      showToast(`PO ${targetPO.poNumber} status updated to "${newStatus}"`);
    }

    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: newStatus } : po))
    );
  };

  const handleCancelPO = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'Cancelled' } : po))
    );
    showToast(`Cancelled purchase order`);
  };

  const handleUpdatePO = (updatedPO: PurchaseOrder) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === updatedPO.id ? updatedPO : po))
    );
    showToast(`Updated purchase order ${updatedPO.poNumber}`);
  };

  // Quick 1-click Draft PO generator from recommendations
  const handleQuickReorder = (product: Product, quantityOverride?: number) => {
    const sup = suppliers.find((s) => s.id === product.supplierId) || suppliers[0];
    const qty = quantityOverride || product.recommendedOrderQty || 25;
    const unitPrice = Number((product.unitPrice * (sup.unitPriceIndex || 1.0)).toFixed(2));
    const totalAmount = Number((unitPrice * qty).toFixed(2));

    const today = new Date();
    const expected = new Date(today);
    expected.setDate(today.getDate() + (product.leadTime || 4));

    const count = purchaseOrders.length + 1;
    const poNumber = `PO-2026-${count.toString().padStart(3, '0')}`;

    const newPO: PurchaseOrder = {
      id: `PO-${Date.now().toString().slice(-4)}`,
      poNumber,
      supplierId: sup.id,
      supplierName: sup.name,
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitPrice,
          totalPrice: totalAmount,
        },
      ],
      totalAmount,
      orderDate: today.toISOString().split('T')[0],
      expectedDelivery: expected.toISOString().split('T')[0],
      status: 'Draft',
      notes: `Automated reorder triggered from ${product.status} alert. Stock coverage was ${product.daysRemaining} days.`,
      createdFromAlert: true,
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    showToast(`Generated Draft PO ${poNumber} for ${qty}x ${product.name}!`);
    setActiveTab('purchase_orders');
  };

  // Batch reorder for all critical items
  const handleBatchReorderCritical = () => {
    const criticals = enrichedProducts.filter(
      (p) => p.status === 'Critical' || p.status === 'Out of Stock'
    );
    if (criticals.length === 0) {
      showToast('No critical items currently require emergency reordering.');
      return;
    }

    criticals.forEach((p, idx) => {
      const sup = suppliers.find((s) => s.id === p.supplierId) || suppliers[0];
      const qty = p.recommendedOrderQty || 30;
      const unitPrice = Number((p.unitPrice * (sup.unitPriceIndex || 1.0)).toFixed(2));
      const totalAmount = Number((unitPrice * qty).toFixed(2));

      const count = purchaseOrders.length + 1 + idx;
      const poNumber = `PO-2026-${count.toString().padStart(3, '0')}`;

      const newPO: PurchaseOrder = {
        id: `PO-${Date.now().toString().slice(-4)}-${idx}`,
        poNumber,
        supplierId: sup.id,
        supplierName: sup.name,
        items: [
          {
            productId: p.id,
            productName: p.name,
            quantity: qty,
            unitPrice,
            totalPrice: totalAmount,
          },
        ],
        totalAmount,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + p.leadTime * 86400000).toISOString().split('T')[0],
        status: 'Draft',
        notes: `Emergency batch draft order generated for critical product.`,
        createdFromAlert: true,
      };

      setPurchaseOrders((prev) => [newPO, ...prev]);
    });

    showToast(`Batch generated ${criticals.length} draft purchase orders!`);
    setActiveTab('purchase_orders');
  };

  // Reset to original demo dataset
  const handleResetData = () => {
    if (confirm('Reset to initial sample demo data (22 products, 8 suppliers, 6 POs)?')) {
      localStorage.removeItem('nexus_inventory_products');
      localStorage.removeItem('nexus_inventory_suppliers');
      localStorage.removeItem('nexus_inventory_pos');
      setProducts(enrichProducts(INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_SUPPLIERS));
      setSuppliers(INITIAL_SUPPLIERS);
      setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      showToast('Sample dataset restored to initial state.');
    }
  };

  const handleRefreshAi = () => {
    setIsAiRefreshing(true);
    setTimeout(() => {
      setIsAiRefreshing(false);
      showToast('AI Supply Chain audit completed. Insights updated.');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        criticalCount={criticalCount}
        outOfStockCount={outOfStockCount}
        lowStockCount={lowStockCount}
        onResetData={handleResetData}
        onOpenCollegeHub={() => setActiveTab('college_hub')}
        isAiActive={isAiActive}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          reorderAlertsCount={criticalCount + outOfStockCount + lowStockCount}
          criticalRiskCount={criticalRiskCount}
          pendingPoCount={pendingPoCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-7 bg-slate-950/60">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <DashboardView
                products={enrichedProducts}
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
                sales={sales}
                inventoryTransactions={inventoryTransactions}
                aiAnalysis={aiAnalysis}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onQuickReorder={handleQuickReorder}
                onRefreshAi={handleRefreshAi}
                isAiRefreshing={isAiRefreshing}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                products={enrichedProducts}
                suppliers={suppliers}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onQuickReorder={handleQuickReorder}
              />
            )}

            {activeTab === 'fast_moving' && (
              <FastMovingView
                products={enrichedProducts}
                onQuickReorder={handleQuickReorder}
              />
            )}

            {activeTab === 'reorder_center' && (
              <ReorderCenterView
                products={enrichedProducts}
                suppliers={suppliers}
                onGenerateDraftPO={handleQuickReorder}
                onBatchReorderCritical={handleBatchReorderCritical}
              />
            )}

            {activeTab === 'stockout_risk' && (
              <StockoutRiskView
                products={enrichedProducts}
                suppliers={suppliers}
                onQuickReorder={handleQuickReorder}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView
                suppliers={suppliers}
                onAddSupplier={handleAddSupplier}
                onUpdateSupplier={handleUpdateSupplier}
                onDeleteSupplier={handleDeleteSupplier}
                onNavigateToComparison={() => setActiveTab('supplier_comparison')}
              />
            )}

            {activeTab === 'supplier_comparison' && (
              <SupplierComparisonView
                suppliers={suppliers}
                products={enrichedProducts}
                onSelectSupplierForPO={(sup) => {
                  const prod = enrichedProducts.find((p) => p.supplierId === sup.id) || enrichedProducts[0];
                  handleQuickReorder(prod);
                }}
              />
            )}

            {activeTab === 'purchase_orders' && (
              <PurchaseOrdersView
                purchaseOrders={purchaseOrders}
                suppliers={suppliers}
                products={enrichedProducts}
                onCreatePO={handleCreatePO}
                onUpdatePO={handleUpdatePO}
                onUpdateStatus={handleUpdatePOStatus}
                onCancelPO={handleCancelPO}
              />
            )}

            {activeTab === 'ai_assistant' && (
              <AiAssistantView
                products={enrichedProducts}
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
                isAiActive={isAiActive}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                products={enrichedProducts}
                suppliers={suppliers}
                purchaseOrders={purchaseOrders}
              />
            )}

            {activeTab === 'college_hub' && <CollegeProjectView />}
          </div>
        </main>
      </div>
    </div>
  );
}
