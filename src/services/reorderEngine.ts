import { Product, Supplier, SalesTransaction, VelocityClassification, RiskLevel, StockStatus, SupplierWeightConfig } from '../types';

export const DEFAULT_WEIGHTS: SupplierWeightConfig = {
  priceWeight: 0.25,
  deliveryWeight: 0.20,
  reliabilityWeight: 0.20,
  qualityWeight: 0.15,
  fulfillmentWeight: 0.20,
};

/**
 * Module 3: Fast-Moving Product Analysis
 * Formula: Daily Sales Velocity = Total Units Sold / Number of Days
 */
export function calculateSalesVelocity(
  sales: SalesTransaction[],
  productId: string,
  daysWindow: number = 14,
  fallbackDailySales: number = 0
): number {
  const productSales = sales.filter((s) => s.productId === productId);
  if (productSales.length === 0) {
    return Number(fallbackDailySales.toFixed(1));
  }
  const totalUnits = productSales.reduce((acc, curr) => acc + curr.quantity, 0);
  const calculated = totalUnits / Math.max(1, daysWindow);
  return Number(calculated.toFixed(1));
}

/**
 * Classify velocity based on academic thresholds:
 * Fast: >= 5.5 units/day
 * Medium: 2.0 - 5.4 units/day
 * Slow: < 2.0 units/day
 */
export function classifyVelocity(velocity: number): VelocityClassification {
  if (velocity >= 5.5) return 'Fast Moving';
  if (velocity >= 2.0) return 'Medium Moving';
  return 'Slow Moving';
}

/**
 * Module 4: Reorder Point Formula
 * Formula: Reorder Point = (Average Daily Sales × Supplier Lead Time) + Safety Stock
 */
export function calculateReorderPoint(
  averageDailySales: number,
  leadTime: number,
  safetyStock: number
): number {
  return Math.ceil(averageDailySales * leadTime + safetyStock);
}

/**
 * Module 5: Stock-out Risk Prediction
 * Days of Stock Remaining = Current Stock / Average Daily Sales
 */
export function calculateDaysRemaining(currentStock: number, averageDailySales: number): number {
  if (averageDailySales <= 0) return currentStock > 0 ? 999 : 0;
  return Number((currentStock / averageDailySales).toFixed(1));
}

/**
 * Evaluates Stock-out Risk considering all 5 parameters:
 * 1. Current Stock
 * 2. Average Daily Sales
 * 3. Supplier Lead Time
 * 4. Safety Stock
 * 5. Reorder Point
 */
export function calculateStockoutRisk(
  currentStock: number,
  averageDailySales: number,
  leadTime: number,
  safetyStock: number,
  reorderPoint: number
): { risk: RiskLevel; reason: string } {
  if (currentStock <= 0) {
    return {
      risk: 'CRITICAL',
      reason: 'Out of stock (0 units). Product has completely run out. Sales are actively lost.',
    };
  }

  const daysRemaining = calculateDaysRemaining(currentStock, averageDailySales);

  // Critical risk: current stock has breached safety stock OR days remaining <= supplier lead time
  if (currentStock <= safetyStock || daysRemaining <= leadTime) {
    return {
      risk: 'CRITICAL',
      reason: `Current stock (${currentStock} units) has breached safety stock (${safetyStock} units) or stock coverage (${daysRemaining} days) is ≤ supplier lead time (${leadTime} days). Immediate stock-out will occur before delivery arrives.`,
    };
  }

  // High risk: current stock is at/below reorder point OR coverage is dangerously close to lead time (<= 1.5x lead time)
  if (currentStock <= reorderPoint || daysRemaining <= leadTime * 1.5) {
    return {
      risk: 'HIGH',
      reason: `Current stock (${currentStock} units) is at or below Reorder Point (${reorderPoint} units) with only ${daysRemaining} days coverage remaining vs ${leadTime} days supplier lead time. Buffer is depleted.`,
    };
  }

  // Medium risk: stock is within 1.5x reorder point or days remaining <= 2.5x lead time
  if (currentStock <= Math.ceil(reorderPoint * 1.4) || daysRemaining <= leadTime * 2.5) {
    return {
      risk: 'MEDIUM',
      reason: `Stock level (${currentStock} units, ${daysRemaining} days coverage) is approaching reorder threshold (${reorderPoint} units). Sufficient for current cycle, but needs monitoring.`,
    };
  }

  // Low risk: healthy cushion above ROP and safety stock
  return {
    risk: 'LOW',
    reason: `Healthy inventory cushion (${currentStock} units, ${daysRemaining} days coverage). Well above reorder point (${reorderPoint} units) and safety stock (${safetyStock} units). Lead time is ${leadTime} days.`,
  };
}

/**
 * Classifies product stock status strictly as:
 * OUT OF STOCK: currentStock <= 0
 * CRITICAL: 0 < currentStock <= safetyStock
 * LOW STOCK: safetyStock < currentStock <= reorderPoint
 * HEALTHY: currentStock > reorderPoint
 */
export function calculateStockStatus(
  currentStock: number,
  reorderPoint: number,
  safetyStock: number
): StockStatus {
  if (currentStock <= 0) return 'Out of Stock';
  if (currentStock <= safetyStock) return 'Critical';
  if (currentStock <= reorderPoint) return 'Low Stock';
  return 'Healthy';
}

/**
 * Module 4: Recommended Reorder Quantity
 * Formula: EOQ / Target Coverage Model
 * Recommended Qty = (ADS * (LeadTime + ReplenishmentCycleDays)) + SafetyStock - CurrentStock
 * Adjusted for Supplier Minimum Order Quantity (MOQ).
 */
export function calculateRecommendedReorderQuantity(
  product: Product,
  supplier?: Supplier,
  replenishmentCycleDays: number = 14
): number {
  const targetStock = product.averageDailySales * (product.leadTime + replenishmentCycleDays) + product.safetyStock;
  const shortfall = targetStock - product.currentStock;
  const rawQty = Math.max(0, Math.ceil(shortfall));
  const moq = supplier?.minOrderQuantity || 10;
  return Math.max(moq, rawQty);
}

/**
 * Module 7: AI Supplier Scoring System
 * Transparent scoring across 5 key dimensions:
 * 1. Price - 25% (normalized: lower unit price index gets higher score)
 * 2. Delivery Time - 20% (normalized: shorter lead time gets higher score)
 * 3. Reliability - 20% (on-time delivery % directly 0-100)
 * 4. Quality - 15% (rating 1-5 scaled to 0-100 minus return rate penalty)
 * 5. Fulfillment Rate - 20% (fulfillment % directly 0-100)
 */
export function evaluateSupplier(
  supplier: Supplier,
  weights: SupplierWeightConfig = DEFAULT_WEIGHTS,
  allSuppliers?: Supplier[]
): {
  overallScore: number;
  breakdown: {
    priceScore: number;
    deliveryScore: number;
    reliabilityScore: number;
    qualityScore: number;
    fulfillmentScore: number;
  };
  recommendationExplanation: string;
} {
  // Determine min and max for normalization
  let minPrice = 0.85;
  let maxPrice = 1.15;
  let minDelivery = 2;
  let maxDelivery = 10;

  if (allSuppliers && allSuppliers.length > 1) {
    minPrice = Math.min(...allSuppliers.map((s) => s.unitPriceIndex));
    maxPrice = Math.max(...allSuppliers.map((s) => s.unitPriceIndex));
    minDelivery = Math.min(...allSuppliers.map((s) => s.averageDeliveryTime));
    maxDelivery = Math.max(...allSuppliers.map((s) => s.averageDeliveryTime));
  }

  // 1. Normalized Price Score (25% weight):
  // Lower price index = higher score. Scale 60 - 100.
  const priceRange = maxPrice - minPrice || 0.1;
  const normalizedPrice = ((maxPrice - supplier.unitPriceIndex) / priceRange) * 40 + 60;
  const priceScore = Number(Math.max(40, Math.min(100, normalizedPrice)).toFixed(1));

  // 2. Normalized Delivery Time Score (20% weight):
  // Shorter lead time = higher score. Scale 45 - 100.
  const deliveryRange = maxDelivery - minDelivery || 1;
  const normalizedDelivery = ((maxDelivery - supplier.averageDeliveryTime) / deliveryRange) * 55 + 45;
  const deliveryScore = Number(Math.max(30, Math.min(100, normalizedDelivery)).toFixed(1));

  // 3. Normalized Reliability Score (20% weight):
  // On-time delivery rate is already 0-100
  const reliabilityScore = Number(Math.max(0, Math.min(100, supplier.onTimeDeliveryRate)).toFixed(1));

  // 4. Normalized Quality Score (15% weight):
  // (Rating / 5.0) * 100 penalizing return defect rate
  const rawQuality = (supplier.qualityRating / 5.0) * 100 - supplier.returnRate * 2.0;
  const qualityScore = Number(Math.max(40, Math.min(100, rawQuality)).toFixed(1));

  // 5. Normalized Fulfillment Score (20% weight):
  // Fulfillment rate is already 0-100
  const fulfillmentScore = Number(Math.max(0, Math.min(100, supplier.fulfillmentRate)).toFixed(1));

  // Overall Weighted Score (0 - 100)
  const overall =
    priceScore * weights.priceWeight +
    deliveryScore * weights.deliveryWeight +
    reliabilityScore * weights.reliabilityWeight +
    qualityScore * weights.qualityWeight +
    fulfillmentScore * weights.fulfillmentWeight;

  const overallScore = Number(overall.toFixed(1));

  // Detailed transparent recommendation reason explaining why
  let reason = '';
  if (overallScore >= 92) {
    reason = `Recommended because ${supplier.name} has a competitive unit price (${supplier.unitPriceIndex}x benchmark), high on-time delivery rate (${supplier.onTimeDeliveryRate}%), strong fulfillment rate (${supplier.fulfillmentRate}%), and shorter average lead time (${supplier.averageDeliveryTime} days).`;
  } else if (overallScore >= 82) {
    reason = `Recommended for reliable replenishment due to strong fulfillment (${supplier.fulfillmentRate}%), solid quality rating (${supplier.qualityRating}/5.0), and dependable delivery cycle (${supplier.averageDeliveryTime} days).`;
  } else if (overallScore >= 72) {
    reason = `Viable secondary vendor with acceptable quality (${supplier.qualityRating}/5.0), though delivery lead time (${supplier.averageDeliveryTime} days) or price index (${supplier.unitPriceIndex}x) requires forward planning.`;
  } else {
    reason = `Higher operational friction detected: lead time is ${supplier.averageDeliveryTime} days, on-time rate is ${supplier.onTimeDeliveryRate}%, and return rate is ${supplier.returnRate}%. Not recommended for critical fast-moving goods.`;
  }

  return {
    overallScore,
    breakdown: {
      priceScore,
      deliveryScore,
      reliabilityScore,
      qualityScore,
      fulfillmentScore,
    },
    recommendationExplanation: reason,
  };
}

/**
 * Enriches product list with real-time calculated metrics
 */
export function enrichProducts(products: Product[], sales: SalesTransaction[], suppliers: Supplier[]): Product[] {
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

  return products.map((prod) => {
    const velocity = calculateSalesVelocity(sales, prod.id, 14, prod.averageDailySales);
    const velocityClass = classifyVelocity(velocity);
    const reorderPoint = calculateReorderPoint(prod.averageDailySales, prod.leadTime, prod.safetyStock);
    const status = calculateStockStatus(prod.currentStock, reorderPoint, prod.safetyStock);
    const daysRemaining = calculateDaysRemaining(prod.currentStock, prod.averageDailySales);
    const riskData = calculateStockoutRisk(
      prod.currentStock,
      prod.averageDailySales,
      prod.leadTime,
      prod.safetyStock,
      reorderPoint
    );
    const supplier = supplierMap.get(prod.supplierId);
    const recommendedQty = calculateRecommendedReorderQuantity(prod, supplier);

    return {
      ...prod,
      reorderPoint,
      status,
      salesVelocity: velocity,
      velocityClass,
      daysRemaining,
      stockoutRisk: riskData.risk,
      recommendedOrderQty: recommendedQty,
    };
  });
}
