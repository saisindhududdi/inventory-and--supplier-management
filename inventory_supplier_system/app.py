"""
AI-Based Inventory & Supplier Management System
Full Flask Application Entrypoint
College Mini Project
"""
from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from config import Config
from services.inventory_engine import (
    calculate_reorder_point,
    classify_velocity,
    evaluate_stockout_risk,
    calculate_stock_status,
    calculate_sales_velocity
)
from services.reorder_engine import calculate_recommended_order_quantity
from services.supplier_engine import rank_suppliers
from services.gemini_service import query_gemini_or_fallback
from models.product import ProductModel
from models.supplier import SupplierModel
from models.purchase_order import PurchaseOrderModel
from models.inventory import InventoryTransactionModel

app = Flask(__name__)
app.config.from_object(Config)

def get_db():
    conn = sqlite3.connect(app.config['DATABASE_PATH'])
    conn.row_factory = sqlite3.Row
    return conn

# Ensure database exists
if not os.path.exists(app.config['DATABASE_PATH']):
    from seed_data import seed_database
    seed_database(app.config['DATABASE_PATH'])

# ----------------- WEB ROUTE -----------------
@app.route('/')
def home():
    return render_template('index.html')

# ----------------- PRODUCT ENDPOINTS -----------------
@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db()
    products = ProductModel.get_all(conn)
    conn.close()
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json() or {}
    conn = get_db()
    prod_id = f"PRD-{int(conn.execute('SELECT COUNT(*) FROM products').fetchone()[0]) + 101}"
    data['id'] = prod_id
    data['reorder_point'] = calculate_reorder_point(
        float(data.get('average_daily_sales', 4.0)),
        int(data.get('lead_time', 4)),
        int(data.get('safety_stock', 10))
    )
    data['status'] = calculate_stock_status(
        int(data.get('current_stock', 20)),
        data['reorder_point'],
        int(data.get('safety_stock', 10))
    )
    ProductModel.create(conn, data)
    conn.close()
    return jsonify({'message': 'Product created', 'id': prod_id}), 201

@app.route('/api/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json() or {}
    conn = get_db()
    data['reorder_point'] = calculate_reorder_point(
        float(data.get('average_daily_sales', 4.0)),
        int(data.get('lead_time', 4)),
        int(data.get('safety_stock', 10))
    )
    data['status'] = calculate_stock_status(
        int(data.get('current_stock', 20)),
        data['reorder_point'],
        int(data.get('safety_stock', 10))
    )
    ProductModel.update(conn, product_id, data)
    conn.close()
    return jsonify({'message': 'Product updated'})

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db()
    ProductModel.delete(conn, product_id)
    conn.close()
    return jsonify({'message': 'Product deleted'})

# ----------------- SUPPLIER ENDPOINTS -----------------
@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    conn = get_db()
    suppliers = SupplierModel.get_all(conn)
    conn.close()
    return jsonify(suppliers)

@app.route('/api/suppliers', methods=['POST'])
def add_supplier():
    data = request.get_json() or {}
    conn = get_db()
    sup_id = f"SUP-00{int(conn.execute('SELECT COUNT(*) FROM suppliers').fetchone()[0]) + 1}"
    data['id'] = sup_id
    SupplierModel.create(conn, data)
    conn.close()
    return jsonify({'message': 'Supplier created', 'id': sup_id}), 201

@app.route('/api/suppliers/<supplier_id>', methods=['PUT'])
def update_supplier(supplier_id):
    data = request.get_json() or {}
    conn = get_db()
    SupplierModel.update(conn, supplier_id, data)
    conn.close()
    return jsonify({'message': 'Supplier updated'})

@app.route('/api/suppliers/<supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id):
    conn = get_db()
    SupplierModel.delete(conn, supplier_id)
    conn.close()
    return jsonify({'message': 'Supplier deleted'})

# ----------------- INVENTORY & REORDER ALERTS -----------------
@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    conn = get_db()
    products = ProductModel.get_all(conn)
    conn.close()
    enriched = []
    for p in products:
        ads = p['average_daily_sales']
        stock = p['current_stock']
        lead = p['lead_time']
        risk_info = evaluate_stockout_risk(stock, ads, lead)
        enriched.append({
            **p,
            'velocity_class': classify_velocity(ads),
            'stockout_risk': risk_info['risk'],
            'stockout_reason': risk_info['reason'],
            'recommended_order_qty': calculate_recommended_order_quantity(
                stock, ads, lead, p['safety_stock']
            )
        })
    return jsonify(enriched)

@app.route('/api/inventory/alerts', methods=['GET'])
def get_inventory_alerts():
    conn = get_db()
    products = ProductModel.get_all(conn)
    conn.close()
    alerts = []
    for p in products:
        risk = evaluate_stockout_risk(p['current_stock'], p['average_daily_sales'], p['lead_time'])
        if p['current_stock'] <= p['reorder_point'] or risk['risk'] in ['HIGH', 'CRITICAL']:
            alerts.append({
                'product_id': p['id'],
                'product_name': p['name'],
                'current_stock': p['current_stock'],
                'reorder_point': p['reorder_point'],
                'risk': risk['risk'],
                'reason': risk['reason']
            })
    return jsonify(alerts)

# ----------------- SUPPLIER RECOMMENDATIONS (MCDA) -----------------
@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    conn = get_db()
    suppliers = SupplierModel.get_all(conn)
    conn.close()
    ranked = rank_suppliers(suppliers)
    return jsonify({
        'top_supplier': ranked[0] if ranked else None,
        'all_ranked': ranked
    })

# ----------------- PURCHASE ORDERS -----------------
@app.route('/api/purchase-orders', methods=['GET'])
def get_purchase_orders():
    conn = get_db()
    orders = PurchaseOrderModel.get_all(conn)
    conn.close()
    return jsonify(orders)

@app.route('/api/purchase-orders', methods=['POST'])
def create_purchase_order():
    data = request.get_json() or {}
    conn = get_db()
    count = conn.execute('SELECT COUNT(*) FROM purchase_orders').fetchone()[0] + 1
    po_id = f"PO-{count + 9000}"
    po_number = f"PO-2026-{count:03d}"
    data['id'] = po_id
    data['po_number'] = po_number
    PurchaseOrderModel.create(conn, data)
    conn.close()
    return jsonify({'message': 'PO created', 'po_number': po_number}), 201

@app.route('/api/purchase-orders/<po_id>/status', methods=['PUT'])
def update_po_status(po_id):
    data = request.get_json() or {}
    new_status = data.get('status', 'Pending')
    conn = get_db()
    PurchaseOrderModel.update_status(conn, po_id, new_status)
    conn.close()
    return jsonify({'message': f'PO status changed to {new_status}'})

# ----------------- AI ASSISTANT ENDPOINTS -----------------
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.get_json() or {}
    prompt = data.get('prompt', '')
    reply = query_gemini_or_fallback(prompt)
    return jsonify({'reply': reply})

@app.route('/api/ai/analyze', methods=['POST'])
def ai_analyze():
    data = request.get_json() or {}
    products = data.get('products', [])
    prompt = f"Perform a high-level strategic supply chain audit for {len(products)} inventory items."
    reply = query_gemini_or_fallback(prompt)
    return jsonify({'analysis': reply, 'mode': 'gemini_or_rule'})

# ----------------- SYSTEM HEALTH -----------------
@app.route('/api/health', methods=['GET'])
def health():
    gemini_key = os.getenv('GEMINI_API_KEY', '')
    is_gemini_configured = bool(gemini_key and gemini_key != 'your_gemini_api_key_here')
    return jsonify({
        'status': 'healthy',
        'geminiConfigured': is_gemini_configured,
        'service': 'Flask Inventory & Supplier Engine'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 AI Inventory & Supplier System started on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
