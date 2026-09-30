export type StockStatus = 'Healthy' | 'Low Stock' | 'Critical' | 'Out of Stock';

export type VelocityClassification = 'Fast Moving' | 'Medium Moving' | 'Slow Moving';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type POStatus = 'Draft' | 'Pending' | 'Approved' | 'Ordered' | 'Shipped' | 'Delivered' | 'Cancelled';

export type SupplierStatus = 'Active' | 'Preferred' | 'Under Review' | 'Inactive';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  currentStock: number;
  unitPrice: number;
  averageDailySales: number;
  leadTime: number; // in days
  safetyStock: number;
  reorderPoint: number;
  supplierId: string;
  supplierName: string;
  lastRestocked: string;
  status: StockStatus;
  // Computed analytics
  salesVelocity?: number;
  velocityClass?: VelocityClassification;
  daysRemaining?: number;
  stockoutRisk?: RiskLevel;
  recommendedOrderQty?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  productsSupplied: string[]; // Product names or categories
  unitPriceIndex: number; // 1.0 = standard, 0.9 = 10% cheaper, 1.1 = 10% expensive
  averageDeliveryTime: number; // in days
  onTimeDeliveryRate: number; // percentage 0-100
  qualityRating: number; // 1.0 - 5.0
  fulfillmentRate: number; // percentage 0-100
  returnRate: number; // percentage 0-100
  minOrderQuantity: number;
  status: SupplierStatus;
  // Computed score
  overallScore?: number;
  scoreBreakdown?: {
    priceScore: number;
    deliveryScore: number;
    reliabilityScore: number;
    qualityScore: number;
    fulfillmentScore: number;
  };
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  status: POStatus;
  notes?: string;
  createdFromAlert?: boolean;
}

export interface SalesTransaction {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  balanceAfter: number;
  date: string;
  reference?: string;
}

export interface SupplierWeightConfig {
  priceWeight: number; // e.g. 0.25
  deliveryWeight: number; // e.g. 0.20
  reliabilityWeight: number; // e.g. 0.20
  qualityWeight: number; // e.g. 0.15
  fulfillmentWeight: number; // e.g. 0.20
}

export interface AIAnalysisResult {
  summary: string;
  criticalAlerts: string[];
  recommendations: {
    productId: string;
    productName: string;
    action: string;
    recommendedQty: number;
    preferredSupplier: string;
    reasoning: string;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  supplierComparison?: {
    recommendedSupplierId: string;
    recommendedSupplierName: string;
    rationale: string;
  };
  inventoryHealthScore: number; // 0-100
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structuredData?: any;
}
