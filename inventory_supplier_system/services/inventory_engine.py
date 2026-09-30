import math

def calculate_sales_velocity(units_sold, days=14):
    """Formula: Daily Sales Velocity = Total Units Sold / Number of Days"""
    if days <= 0:
        return 0.0
    return round(units_sold / days, 1)

def classify_velocity(velocity):
    """
    Classify product turnover:
    Fast Moving: >= 5.5 units/day
    Medium Moving: 2.0 to 5.4 units/day
    Slow Moving: < 2.0 units/day
    """
    if velocity >= 5.5:
        return 'Fast Moving'
    elif velocity >= 2.0:
        return 'Medium Moving'
    return 'Slow Moving'

def calculate_reorder_point(daily_sales, lead_time, safety_stock):
    """
    Reorder Point (ROP) = (Average Daily Sales * Lead Time) + Safety Stock
    """
    return math.ceil(daily_sales * lead_time + safety_stock)

def calculate_days_remaining(current_stock, daily_sales):
    """
    Days of Stock Remaining = Current Stock / Average Daily Sales
    """
    if daily_sales <= 0:
        return 999.0 if current_stock > 0 else 0.0
    return round(current_stock / daily_sales, 1)

def evaluate_stockout_risk(current_stock, daily_sales, lead_time):
    """
    Evaluates whether inventory coverage is below supplier replenishment lead time.
    """
    if current_stock <= 0:
        return {
            'risk': 'CRITICAL',
            'reason': 'Inventory is at zero. Product is experiencing an ongoing stock-out.'
        }
    
    days_left = calculate_days_remaining(current_stock, daily_sales)
    
    if days_left <= lead_time:
        return {
            'risk': 'CRITICAL',
            'reason': f'Stock will deplete in {days_left} days, which is less than or equal to supplier delivery time ({lead_time} days).'
        }
    elif days_left <= lead_time * 1.5:
        return {
            'risk': 'HIGH',
            'reason': f'Stock coverage ({days_left} days) is close to vendor lead time ({lead_time} days).'
        }
    elif days_left <= lead_time * 2.5:
        return {
            'risk': 'MEDIUM',
            'reason': f'Adequate buffer for current order cycle ({days_left} days left vs {lead_time} days lead time).'
        }
    return {
        'risk': 'LOW',
        'reason': f'Healthy cushion: {days_left} days coverage exceeds lead time of {lead_time} days.'
    }

def calculate_stock_status(current_stock, reorder_point, safety_stock):
    if current_stock <= 0:
        return 'Out of Stock'
    if current_stock <= safety_stock or current_stock <= math.ceil(reorder_point * 0.45):
        return 'Critical'
    if current_stock <= reorder_point:
        return 'Low Stock'
    return 'Healthy'
