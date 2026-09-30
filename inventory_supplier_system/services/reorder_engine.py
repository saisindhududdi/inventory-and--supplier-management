import math

def calculate_recommended_order_quantity(current_stock, daily_sales, lead_time, safety_stock, min_order_qty=10, cycle_days=14):
    """
    Recommended Reorder Quantity = (ADS * (LeadTime + ReplenishmentCycle)) + SafetyStock - CurrentStock
    Adjusted to meet Supplier Minimum Order Quantity (MOQ).
    """
    target_inventory = (daily_sales * (lead_time + cycle_days)) + safety_stock
    shortfall = target_inventory - current_stock
    raw_qty = max(0, math.ceil(shortfall))
    return max(min_order_qty, raw_qty)
