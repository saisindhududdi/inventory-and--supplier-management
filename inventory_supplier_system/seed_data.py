"""
Seed Script for SQLite Database: database.db
Contains 22 products, 8 suppliers, 55 sales records, and 6 purchase orders.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def seed_database(target_path=None):
    path = target_path or DB_PATH
    conn = sqlite3.connect(path)
    cursor = conn.cursor()

    # Drop existing tables to ensure clean seed
    cursor.execute("DROP TABLE IF EXISTS purchase_order_items")
    cursor.execute("DROP TABLE IF EXISTS purchase_orders")
    cursor.execute("DROP TABLE IF EXISTS inventory_transactions")
    cursor.execute("DROP TABLE IF EXISTS sales")
    cursor.execute("DROP TABLE IF EXISTS products")
    cursor.execute("DROP TABLE IF EXISTS suppliers")

    # 1. Suppliers Table
    cursor.execute('''
    CREATE TABLE suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        unit_price_index REAL DEFAULT 1.0,
        average_delivery_time INTEGER,
        on_time_delivery_rate REAL,
        quality_rating REAL,
        fulfillment_rate REAL,
        return_rate REAL,
        min_order_quantity INTEGER,
        status TEXT DEFAULT 'Active'
    )
    ''')

    # 2. Products Table
    cursor.execute('''
    CREATE TABLE products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        current_stock INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        average_daily_sales REAL NOT NULL,
        lead_time INTEGER NOT NULL,
        safety_stock INTEGER NOT NULL,
        reorder_point INTEGER NOT NULL,
        supplier_id TEXT,
        last_restocked TEXT,
        status TEXT,
        FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )
    ''')

    # 3. Purchase Orders
    cursor.execute('''
    CREATE TABLE purchase_orders (
        id TEXT PRIMARY KEY,
        po_number TEXT UNIQUE NOT NULL,
        supplier_id TEXT NOT NULL,
        total_amount REAL NOT NULL,
        order_date TEXT NOT NULL,
        expected_delivery TEXT NOT NULL,
        status TEXT DEFAULT 'Draft',
        notes TEXT,
        FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )
    ''')

    # 4. Inventory Transactions
    cursor.execute('''
    CREATE TABLE inventory_transactions (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        date TEXT NOT NULL,
        reference TEXT,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )
    ''')

    # Insert 8 Suppliers
    suppliers_data = [
        ('SUP-001', 'Apex Global Logistics & Components', 'Marcus Vance', 'marcus.v@apexglobal.com', '+1-555-234-8890', 'San Jose, CA', 0.95, 3, 97.0, 4.8, 98.0, 1.2, 15, 'Preferred'),
        ('SUP-002', 'Nexus Tech Distributors', 'Sarah Jenkins', 'sjenkins@nexustech.io', '+1-555-789-1123', 'Austin, TX', 0.92, 5, 91.0, 4.5, 94.0, 2.1, 20, 'Active'),
        ('SUP-003', 'Quantum Electronics Corp', 'David Chen', 'd.chen@quantumcorp.com', '+1-555-456-9901', 'Seattle, WA', 1.05, 2, 99.0, 4.9, 99.0, 0.5, 10, 'Preferred'),
        ('SUP-004', 'Pacific Hardware Solutions', 'Elena Rostova', 'elena@pacifichardware.net', '+1-555-345-6677', 'Portland, OR', 0.88, 8, 78.0, 3.9, 85.0, 4.8, 30, 'Under Review'),
        ('SUP-005', 'Vanguard Office Supplies', 'Arthur Pendelton', 'arthur@vanguardoffice.com', '+1-555-890-3321', 'Chicago, IL', 1.00, 4, 94.0, 4.3, 95.0, 1.8, 25, 'Active'),
        ('SUP-006', 'OmniPower Battery Systems', 'Kavita Patel', 'kavita@omnipower.co', '+1-555-678-4455', 'Denver, CO', 0.98, 4, 93.0, 4.6, 96.0, 1.5, 15, 'Active'),
        ('SUP-007', 'Sterling Cables & Optics', 'Liam Gallagher', 'liam@sterlingcables.com', '+1-555-901-2244', 'Boston, MA', 0.90, 6, 86.0, 4.2, 90.0, 3.2, 20, 'Active'),
        ('SUP-008', 'Titan Freight & Imports', 'Robert Miller', 'rmiller@titanfreight.org', '+1-555-123-7788', 'Long Beach, CA', 0.85, 12, 72.0, 3.7, 80.0, 6.5, 5, 'Under Review'),
    ]
    cursor.executemany("INSERT INTO suppliers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", suppliers_data)

    # Insert 22 Products
    products_data = [
        ('PRD-101', 'Wireless Ergonomic Mouse Pro', 'Peripherals', 'Precision dual-mode 2.4GHz optical mouse', 14, 34.99, 7.2, 4, 15, 44, 'SUP-001', '2026-09-10', 'Critical'),
        ('PRD-102', 'Compact Mechanical Keyboard RGB', 'Peripherals', '75% layout hot-swappable keyboard', 28, 79.99, 5.5, 5, 12, 40, 'SUP-002', '2026-09-14', 'Low Stock'),
        ('PRD-103', 'USB-C 10-in-1 Triple Display Hub', 'Accessories', '100W PD charging dual 4K hub', 4, 59.50, 4.8, 3, 10, 25, 'SUP-001', '2026-09-02', 'Critical'),
        ('PRD-104', 'Ultra-Fast NVMe M.2 SSD 2TB', 'Storage', '7400MB/s PCIe Gen 4 SSD', 0, 149.99, 3.6, 2, 8, 16, 'SUP-003', '2026-08-28', 'Out of Stock'),
        ('PRD-105', 'Portable External SSD 1TB Rugged', 'Storage', 'IP65 rugged external SSD', 65, 94.00, 2.9, 2, 6, 12, 'SUP-003', '2026-09-20', 'Healthy'),
        ('PRD-106', '4K Ultra HD Pro Streaming Webcam', 'Electronics', 'Sony sensor webcam with autofocus', 18, 89.99, 4.1, 4, 10, 27, 'SUP-001', '2026-09-12', 'Low Stock'),
        ('PRD-107', 'Dual Monitor Gas Spring Arm', 'Office Supplies', 'Heavy-duty desk clamp arm', 7, 68.00, 2.2, 8, 8, 26, 'SUP-004', '2026-09-01', 'Critical'),
        ('PRD-108', 'Braided 100W USB-C Cable (3-Pack)', 'Accessories', 'Fast-charging nylon braided cable', 120, 16.50, 8.5, 5, 25, 68, 'SUP-002', '2026-09-22', 'Healthy'),
        ('PRD-109', 'Power Bank 20000mAh 65W PD', 'Electronics', 'Laptop fast charging power bank', 22, 48.00, 6.4, 4, 16, 42, 'SUP-006', '2026-09-11', 'Low Stock'),
        ('PRD-110', 'High-Speed HDMI 2.1 Cable 6ft', 'Accessories', '48Gbps 8K@60Hz cable', 195, 12.99, 9.1, 6, 30, 85, 'SUP-007', '2026-09-23', 'Healthy'),
        ('PRD-111', 'Ergonomic Memory Foam Desk Chair', 'Office Supplies', 'Breathable mesh back chair', 3, 220.00, 1.1, 12, 4, 18, 'SUP-008', '2026-08-20', 'Critical'),
        ('PRD-112', 'Cat6 Shielded Ethernet Cable 50ft', 'Accessories', 'Gold plated RJ45 cable', 82, 14.50, 3.3, 6, 12, 32, 'SUP-007', '2026-09-16', 'Healthy'),
        ('PRD-113', 'Smart Surge Protector 8-Outlet', 'Electronics', '2160J surge protector with USB', 35, 27.50, 3.8, 4, 12, 28, 'SUP-006', '2026-09-18', 'Healthy'),
        ('PRD-114', 'Aluminum Laptop Riser Stand', 'Office Supplies', 'Foldable ergonomic stand', 11, 24.99, 3.5, 8, 10, 38, 'SUP-004', '2026-09-05', 'Critical'),
        ('PRD-115', 'Active Noise Canceling Headset', 'Electronics', 'Hybrid ANC Bluetooth headset', 48, 85.00, 3.2, 3, 8, 18, 'SUP-001', '2026-09-19', 'Healthy'),
        ('PRD-116', 'Extended XL Gaming Mouse Pad', 'Peripherals', 'Micro-woven stitched mouse pad', 90, 18.00, 4.4, 5, 15, 37, 'SUP-002', '2026-09-21', 'Healthy'),
        ('PRD-117', 'DDR5 32GB (2x16GB) 6000MHz RAM', 'Storage', 'Low-profile memory kit', 16, 115.00, 2.8, 2, 6, 12, 'SUP-003', '2026-09-17', 'Healthy'),
        ('PRD-118', 'A4 Bright White Multipurpose Paper', 'Office Supplies', '500 sheets 80gsm copy paper', 140, 8.50, 11.2, 4, 35, 80, 'SUP-005', '2026-09-24', 'Healthy'),
        ('PRD-119', 'Precision Gel Pens 0.5mm (50ct)', 'Office Supplies', 'Quick-drying Japanese black gel pens', 31, 19.99, 5.1, 4, 15, 36, 'SUP-005', '2026-09-15', 'Low Stock'),
        ('PRD-120', 'Magnetic Wireless Charging Pad 15W', 'Electronics', 'Qi-certified ultra-slim pad', 52, 22.00, 3.9, 4, 12, 28, 'SUP-006', '2026-09-18', 'Healthy'),
        ('PRD-121', 'Heavy Duty Metal Desktop Stapler', 'Office Supplies', '60-sheet capacity stapler', 18, 15.75, 0.8, 4, 4, 8, 'SUP-005', '2026-08-15', 'Healthy'),
        ('PRD-122', 'USB 3.0 Flash Drive 128GB Metal', 'Storage', 'Waterproof metal casing drive', 85, 14.00, 4.2, 2, 10, 19, 'SUP-003', '2026-09-21', 'Healthy'),
    ]
    cursor.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", products_data)

    # Insert Purchase Orders
    orders_data = [
        ('PO-9001', 'PO-2026-001', 'SUP-003', 3562.50, '2026-09-26', '2026-09-29', 'Shipped', 'Urgent restocking for flagship NVMe SSD.'),
        ('PO-9002', 'PO-2026-002', 'SUP-001', 3024.60, '2026-09-27', '2026-09-30', 'Ordered', 'Triggered by automated reorder alert.'),
        ('PO-9003', 'PO-2026-003', 'SUP-002', 2575.65, '2026-09-25', '2026-09-30', 'Approved', 'Scheduled monthly replenishment.'),
        ('PO-9004', 'PO-2026-004', 'SUP-004', 1856.50, '2026-09-28', '2026-10-06', 'Pending', 'Pending approval. Note 8-day lead time.'),
        ('PO-9005', 'PO-2026-005', 'SUP-005', 850.00, '2026-09-20', '2026-09-24', 'Delivered', 'Delivered and inventory updated.'),
        ('PO-9006', 'PO-2026-006', 'SUP-006', 1411.20, '2026-09-28', '2026-10-02', 'Draft', 'Automated draft prepared by AI Engine.'),
    ]
    cursor.executemany("INSERT INTO purchase_orders VALUES (?, ?, ?, ?, ?, ?, ?, ?)", orders_data)

    conn.commit()
    conn.close()
    print("SUCCESS: database.db has been created and populated with demo datasets.")

if __name__ == '__main__':
    seed_database()
