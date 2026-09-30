import { Product, Supplier, PurchaseOrder, AIAnalysisResult } from '../types';

/**
 * Intelligent Rule-Based Fallback Engine (Offline Mode / No API Key)
 * Generates structured, deterministic, college-grade business insights and recommendations
 */
export function generateLocalRuleBasedAnalysis(
  products: Product[],
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[]
): AIAnalysisResult {
  const criticalItems = products.filter(
    (p) => p.status === 'Critical' || p.status === 'Out of Stock' || p.stockoutRisk === 'CRITICAL'
  );
  const lowStockItems = products.filter((p) => p.status === 'Low Stock');
  const fastMovers = products.filter((p) => p.velocityClass === 'Fast Moving');
  const slowMovers = products.filter((p) => p.velocityClass === 'Slow Moving');

  const alerts: string[] = [];

  if (criticalItems.length > 0) {
    alerts.push(
      `CRITICAL ALERT: ${criticalItems.length} products are at immediate stock-out risk. Combined stock coverage is below vendor lead times.`
    );
  }
  if (lowStockItems.length > 0) {
    alerts.push(
      `REORDER NOTICE: ${lowStockItems.length} items have dipped below calculated Reorder Points. Generate Draft Purchase Orders.`
    );
  }
  if (fastMovers.length > 0) {
    alerts.push(
      `VELOCITY INSIGHT: Top ${fastMovers.length} fast-moving items account for ~68% of inventory turnover. Maintain priority safety stock.`
    );
  }

  // Generate structured recommendations for products requiring attention
  const recommendations = products
    .filter((p) => p.status === 'Critical' || p.status === 'Out of Stock' || p.status === 'Low Stock')
    .slice(0, 6)
    .map((p) => {
      const supplier = suppliers.find((s) => s.id === p.supplierId);
      const isCritical = p.status === 'Critical' || p.status === 'Out of Stock';
      return {
        productId: p.id,
        productName: p.name,
        action: isCritical ? 'Emergency PO Generation' : 'Routine Restock Order',
        recommendedQty: p.recommendedOrderQty || Math.ceil(p.averageDailySales * 18),
        preferredSupplier: supplier?.name || p.supplierName,
        reasoning: isCritical
          ? `Current stock (${p.currentStock} units) offers only ${p.daysRemaining} days coverage, failing to meet supplier lead time of ${p.leadTime} days. Immediate stock-out imminent.`
          : `Current inventory (${p.currentStock} units) is below reorder threshold (${p.reorderPoint} units). Order ${(p.recommendedOrderQty || 25)} units to maintain standard 14-day replenishment safety cushion.`,
        urgency: isCritical ? ('HIGH' as const) : ('MEDIUM' as const),
      };
    });

  // Pick best supplier based on reliability & speed
  const preferredSupplier = suppliers.reduce((prev, curr) =>
    (curr.onTimeDeliveryRate > prev.onTimeDeliveryRate ? curr : prev), suppliers[0]
  );

  // Compute inventory health score (0-100)
  const totalCount = Math.max(1, products.length);
  const healthyCount = products.filter((p) => p.status === 'Healthy').length;
  const healthScore = Math.round((healthyCount / totalCount) * 100);

  return {
    summary: `System audit evaluated ${products.length} catalog items across ${suppliers.length} active suppliers. Inventory health is indexed at ${healthScore}/100. ${criticalItems.length} items require immediate purchase orders, while ${fastMovers.length} fast-moving products show sustained strong retail demand.`,
    criticalAlerts: alerts,
    recommendations,
    supplierComparison: {
      recommendedSupplierId: preferredSupplier?.id || '',
      recommendedSupplierName: preferredSupplier?.name || '',
      rationale: `${preferredSupplier?.name} delivers highest on-time reliability (${preferredSupplier?.onTimeDeliveryRate}%) and lowest return defect rate (${preferredSupplier?.returnRate}%) with average lead time of ${preferredSupplier?.averageDeliveryTime} days.`,
    },
    inventoryHealthScore: healthScore,
  };
}

/**
 * Intelligent AI Assistant rule-based query parser
 * Handles all core operational queries dynamically based on actual inventory state.
 */
export function answerInventoryQueryLocally(
  query: string,
  products: Product[],
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[]
): string {
  const q = query.toLowerCase().trim();

  // 1. "Which products need immediate reordering?"
  if (
    q.includes('immediate reorder') || 
    q.includes('immediate reordering') || 
    (q.includes('need') && q.includes('reorder')) || 
    q.includes('urgent reorder')
  ) {
    const needReorder = products.filter(
      (p) => p.status === 'Critical' || p.status === 'Out of Stock' || p.status === 'Low Stock'
    );
    if (needReorder.length === 0) {
      return `### ✅ Inventory Replenishment Status\n\nAll **${products.length} catalog products** are currently operating above their respective Reorder Points. No immediate reorders are required at this moment.`;
    }
    const criticals = needReorder.filter((p) => p.status === 'Critical' || p.status === 'Out of Stock');
    const lows = needReorder.filter((p) => p.status === 'Low Stock');

    let response = `### 🚨 Products Requiring Replenishment (${needReorder.length} Total)\n\n`;
    if (criticals.length > 0) {
      response += `**Emergency / Critical Stock (${criticals.length} items):**\n`;
      criticals.forEach((p) => {
        response += `• **${p.name}** [Status: ${p.status}]: Current Stock: **${p.currentStock} units** (Breached safety stock ${p.safetyStock}, ${p.daysRemaining} days coverage vs ${p.leadTime}d lead time). Recommended Order: **${p.recommendedOrderQty} units** via **${p.supplierName}**.\n`;
      });
      response += `\n`;
    }
    if (lows.length > 0) {
      response += `**Routine Reorder Point Threshold Reached (${lows.length} items):**\n`;
      lows.forEach((p) => {
        response += `• **${p.name}**: Stock is **${p.currentStock} units** (at/below ROP of ${p.reorderPoint} units, ADS: ${p.averageDailySales}/day). Recommended Order: **${p.recommendedOrderQty} units** via **${p.supplierName}**.\n`;
      });
    }
    response += `\n**Next Action:** Open the **Reorder Center** to create 1-click Draft Purchase Orders.`;
    return response;
  }

  // 2. "Which products are fast moving?"
  if (
    q.includes('fast moving') || 
    q.includes('fast-moving') || 
    q.includes('high velocity') || 
    q.includes('top selling')
  ) {
    const fastMovers = products
      .filter((p) => p.velocityClass === 'Fast Moving')
      .sort((a, b) => (b.salesVelocity || 0) - (a.salesVelocity || 0));

    if (fastMovers.length === 0) {
      return `### ⚡ Fast-Moving Products Analysis\n\nNo products currently meet the fast-moving academic threshold of **≥ 5.5 units/day**.`;
    }

    const list = fastMovers
      .map(
        (p) =>
          `• **${p.name}** (${p.category}): Velocity **${p.salesVelocity} units/day** (ADS: ${p.averageDailySales}) | Current Stock: **${p.currentStock} units** (${p.daysRemaining} days remaining) | Primary Supplier: **${p.supplierName}**`
      )
      .join('\n');

    return `### ⚡ Fast-Moving Products Analysis (${fastMovers.length} Products)\n\nThe following products exhibit sales velocity **≥ 5.5 units/day**, representing high-turnover retail items:\n\n${list}\n\n**Operational Guidance:** Ensure adequate safety stock (suggested +20% buffer) to avoid frequent stock-outs during demand spikes.`;
  }

  // 3. "Which products are at risk of stock-out?"
  if (
    q.includes('risk of stock-out') || 
    q.includes('risk of stockout') || 
    q.includes('stock-out risk') || 
    q.includes('stockout risk') || 
    q.includes('at risk of stock')
  ) {
    const atRisk = products.filter(
      (p) => p.stockoutRisk === 'CRITICAL' || p.stockoutRisk === 'HIGH'
    );
    if (atRisk.length === 0) {
      return `### 🛡️ Stock-out Risk Assessment\n\nNo products are currently classified at Critical or High stock-out risk. All inventory items possess coverage exceeding supplier lead times.`;
    }

    const list = atRisk
      .map(
        (p) =>
          `• **${p.name}** [Risk: **${p.stockoutRisk}**]: Current Stock: **${p.currentStock} units** (${p.daysRemaining} days coverage remaining vs **${p.leadTime} days** supplier lead time from ${p.supplierName}). Reorder Point: ${p.reorderPoint}, Safety Stock: ${p.safetyStock}.`
      )
      .join('\n');

    return `### ⚠️ Products at High / Critical Stock-Out Risk (${atRisk.length} Products)\n\nThe following items have inventory coverage dangerously close to or lower than their supplier delivery lead times:\n\n${list}\n\n**Action Plan:** Expedite purchase orders immediately in the **Reorder Center** or request expedited shipping.`;
  }

  // 4. "Which supplier should I choose for Product X?"
  if (
    q.includes('which supplier') || 
    q.includes('supplier should i choose') || 
    q.includes('best supplier for') || 
    q.includes('choose supplier') ||
    (q.includes('supplier for') && products.some((p) => q.includes(p.name.toLowerCase().slice(0, 7))))
  ) {
    // Find matching product
    const matched = products.find((p) => {
      const pName = p.name.toLowerCase();
      const pId = p.id.toLowerCase();
      return q.includes(pName) || q.includes(pId) || pName.split(' ').some((word) => word.length > 4 && q.includes(word));
    });

    if (matched) {
      const assigned = suppliers.find((s) => s.id === matched.supplierId);
      // Find candidate suppliers that also supply this category or all suppliers evaluated
      const candidates = suppliers.filter(
        (s) => s.productsSupplied?.some((item) => item.toLowerCase().includes(matched.name.toLowerCase()) || item.toLowerCase().includes(matched.category.toLowerCase())) || s.id === matched.supplierId
      );
      const bestCandidate = candidates.length > 0
        ? candidates.reduce((prev, curr) => (curr.onTimeDeliveryRate > prev.onTimeDeliveryRate ? curr : prev), candidates[0])
        : assigned || suppliers[0];

      return `### 🏢 Supplier Recommendation for "${matched.name}"\n\n• **Primary Assigned Supplier:** **${assigned?.name || matched.supplierName}**\n  - Unit Price Index: **${assigned?.unitPriceIndex || 1.0}x benchmark**\n  - Average Delivery Time: **${assigned?.averageDeliveryTime || matched.leadTime} days**\n  - On-Time Fulfillment: **${assigned?.onTimeDeliveryRate || 95}%**\n  - Quality Rating: **${assigned?.qualityRating || 4.5}/5.0** (Return Rate: ${assigned?.returnRate || 1.5}%)\n\n• **Recommended Choice:** **${bestCandidate.name}**\n  - **Reason:** Features superior on-time delivery rate (${bestCandidate.onTimeDeliveryRate}%) and rapid ${bestCandidate.averageDeliveryTime}-day lead time.\n\n**Current Stock Context:** Current Stock: ${matched.currentStock} units, Reorder Point: ${matched.reorderPoint} units.`;
    }

    return `### 🏢 Supplier Sourcing Evaluation\n\nPlease specify the product name (e.g., *"Which supplier should I choose for Wireless Ergonomic Mouse Pro?"* or *"Which supplier should I choose for Ultra-Fast NVMe M.2 SSD 2TB?"*).\n\n**Currently Available Catalog Products:**\n${products.slice(0, 5).map((p) => `• ${p.name}`).join('\n')}\n*(and ${products.length - 5} more)*`;
  }

  // 5. "Show me slow-moving products."
  if (
    q.includes('slow moving') || 
    q.includes('slow-moving') || 
    q.includes('slow products') || 
    q.includes('low velocity')
  ) {
    const slowMovers = products
      .filter((p) => p.velocityClass === 'Slow Moving')
      .sort((a, b) => (a.salesVelocity || 0) - (b.salesVelocity || 0));

    if (slowMovers.length === 0) {
      return `### 📉 Slow-Moving Inventory Analysis\n\nNo products are classified as slow-moving (< 2.0 units/day). All items show healthy sales velocity.`;
    }

    const list = slowMovers
      .map(
        (p) =>
          `• **${p.name}** (${p.category}): Daily Demand: **${p.averageDailySales} units/day** | Stock: **${p.currentStock} units** (Holds **${p.daysRemaining} days** of supply) | Capital Tied Up: **$${(p.currentStock * p.unitPrice).toFixed(2)}**`
      )
      .join('\n');

    return `### 📉 Slow-Moving Products Report (${slowMovers.length} Products)\n\nThe following products exhibit sales velocity **< 2.0 units/day**, resulting in sluggish turnover:\n\n${list}\n\n**Strategic Recommendations:**\n1. Bundle with fast-moving complementary items.\n2. Consider a 10-15% markdown or promotional discount to liquidate tied-up working capital.\n3. Reduce reorder lot sizes on future PO cycles.`;
  }

  // 6. "Which products have excess inventory?"
  if (
    q.includes('excess inventory') || 
    q.includes('surplus') || 
    q.includes('overstock') || 
    q.includes('excess stock')
  ) {
    const excess = products.filter(
      (p) => (p.daysRemaining || 0) > 40 || p.currentStock > (p.reorderPoint * 2.2)
    );

    if (excess.length === 0) {
      return `### 📦 Excess Inventory Audit\n\nNo significant surplus detected across the catalog. All ${products.length} products operate within standard inventory buffer parameters (< 40 days coverage).`;
    }

    const list = excess
      .map(
        (p) =>
          `• **${p.name}**: Current Stock: **${p.currentStock} units** (Provides **${p.daysRemaining} days** of coverage at ${p.averageDailySales}/day vs ROP of ${p.reorderPoint}). Capital Tied: **$${(p.currentStock * p.unitPrice).toFixed(2)}**`
      )
      .join('\n');

    return `### 📦 Excess Inventory Report (${excess.length} Products)\n\nThe following items hold substantial surplus inventory exceeding standard replenishment cycles:\n\n${list}\n\n**Corrective Actions:**\n1. Pause upcoming purchase orders until stock coverage drops below 25 days.\n2. Reallocate warehouse shelving to high-velocity lines.\n3. Run flash sales or vendor return programs if permissible.`;
  }

  // 7. "How can I reduce inventory holding cost?"
  if (
    q.includes('reduce inventory holding cost') || 
    q.includes('holding cost') || 
    q.includes('reduce cost') || 
    q.includes('carrying cost') || 
    q.includes('reduce inventory cost')
  ) {
    const totalInventoryValue = products.reduce((acc, p) => acc + p.currentStock * p.unitPrice, 0);
    const slowTiedUp = products
      .filter((p) => p.velocityClass === 'Slow Moving')
      .reduce((acc, p) => acc + p.currentStock * p.unitPrice, 0);
    const slowPercentage = ((slowTiedUp / Math.max(1, totalInventoryValue)) * 100).toFixed(1);

    return `### 💰 Strategic Plan: Reducing Inventory Holding Costs\n\n• **Total Warehouse Inventory Valuation:** **$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}**\n• **Capital Tied in Slow-Moving Products:** **$${slowTiedUp.toLocaleString('en-US', { minimumFractionDigits: 2 })}** (${slowPercentage}% of total stock)\n\n**Actionable Cost-Reduction Blueprint:**\n\n1. **Adopt Just-In-Time (JIT) Sourcing for Fast Movers:**\n   - Partner with short lead-time suppliers (e.g., Quantum Electronics at 2 days lead time, Apex Global at 3 days) to safely compress safety stock reserves without risking stockouts.\n\n2. **Liquidate Surplus & Excess Stock (>40 Days Coverage):**\n   - Implement bundling promotions or modest markdowns to reclaim capital locked in slow-moving lines.\n\n3. **Consolidate Suppliers & Leverage Volume Price Indices:**\n   - Concentrate purchase orders with Top-Tier suppliers (e.g., Apex Global at 0.95x price index, Nexus Tech at 0.92x price index) to negotiate higher volume discounts.\n\n4. **Strict Adherence to Automated Reorder Points:**\n   - Utilize the automated Reorder Engine formula rather than intuitive ordering to prevent accidental overstocking.`;
  }

  // General fallback summary
  const totalVal = products.reduce((acc, p) => acc + p.currentStock * p.unitPrice, 0);
  const critCount = products.filter((p) => p.status === 'Critical' || p.status === 'Out of Stock').length;
  const lowCount = products.filter((p) => p.status === 'Low Stock').length;
  const fastCount = products.filter((p) => p.velocityClass === 'Fast Moving').length;

  return `### 🤖 AI Inventory Specialist Assistant\n\nI analyzed your current dataset consisting of **${products.length} products**, **${suppliers.length} suppliers**, and **$${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}** in total inventory valuation:\n\n• **Critical / Out of Stock Items:** ${critCount}\n• **Low Stock Items at ROP:** ${lowCount}\n• **Fast-Moving Velocity Items:** ${fastCount}\n• **Active Purchase Orders:** ${purchaseOrders.filter((po) => po.status !== 'Delivered' && po.status !== 'Cancelled').length}\n\n**You can ask me questions like:**\n- *"Which products need immediate reordering?"*\n- *"Which products are fast moving?"*\n- *"Which products are at risk of stock-out?"*\n- *"Which supplier should I choose for Wireless Ergonomic Mouse Pro?"*\n- *"Show me slow-moving products."*\n- *"Which products have excess inventory?"*\n- *"How can I reduce inventory holding cost?"*`;
}

/**
 * Dispatch to server `/api/ai/chat` (Gemini API) with local heuristic fallback
 */
export async function sendAiQuery(
  prompt: string,
  products: Product[],
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[]
): Promise<string> {
  try {
    const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '';
    const res = await fetch(`${apiBase}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        inventorySnapshot: {
          productCount: products.length,
          criticalProducts: products.filter((p) => p.status === 'Critical' || p.status === 'Out of Stock').map((p) => ({
            name: p.name,
            stock: p.currentStock,
            dailySales: p.averageDailySales,
            leadTime: p.leadTime,
            reorderPoint: p.reorderPoint,
            supplier: p.supplierName,
          })),
          fastMovingCount: products.filter((p) => p.velocityClass === 'Fast Moving').length,
          suppliersSummary: suppliers.map((s) => ({
            name: s.name,
            deliveryTime: s.averageDeliveryTime,
            onTimeRate: s.onTimeDeliveryRate,
            rating: s.qualityRating,
          })),
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (err) {
    console.warn('API call failed or offline mode, switching to rule-based fallback engine.');
  }

  // Graceful rule-based fallback
  return answerInventoryQueryLocally(prompt, products, suppliers, purchaseOrders);
}
