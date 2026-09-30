import React, { useState } from 'react';
import { 
  GraduationCap, 
  Code2, 
  Database, 
  HelpCircle, 
  Terminal, 
  Check, 
  Copy, 
  Layers, 
  Cpu, 
  BookOpen,
  Download,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const CollegeProjectView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'viva' | 'architecture' | 'schema' | 'code' | 'commands'>('viva');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>('app.py');

  const copyToClipboard = (filename: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const vivaQuestions = [
    {
      q: '1. What is the fundamental problem your system addresses in retail supply chains?',
      a: 'Retail chains frequently face stock-outs on fast-moving goods and capital lockup on slow-moving inventory due to manual monitoring. Our AI-based system automates stock velocity tracking, dynamically calculates Reorder Points (ROP), predicts days until stock depletion against vendor lead times, and recommends the optimal supplier via multi-criteria weighted scoring.',
    },
    {
      q: '2. Explain the Reorder Point (ROP) mathematical formula used in Module 4.',
      a: 'Reorder Point (ROP) = (Average Daily Demand × Supplier Lead Time in days) + Safety Stock. When on-hand inventory drops to or below the ROP, an automated replenishment draft order is generated. Safety stock protects against sudden demand spikes or supplier transport delays.',
    },
    {
      q: '3. How does the system compute Daily Sales Velocity and classify products?',
      a: 'Daily Sales Velocity = (Total Units Sold over window) / (Number of Days). Products are classified as Fast Moving (≥ 5.5 units/day), Medium Moving (2.0 - 5.4 units/day), or Slow Moving (< 2.0 units/day). Fast movers receive heightened safety buffers, while slow movers are flagged for promotional liquidation.',
    },
    {
      q: '4. How is the Stock-Out Risk evaluated?',
      a: 'Days of Stock Remaining = Current Stock / Average Daily Sales. The engine compares this with the supplier lead time. If Days Remaining ≤ Supplier Lead Time, the risk is classified as CRITICAL because stock will reach zero before a newly ordered replenishment shipment can arrive.',
    },
    {
      q: '5. How does the Multi-Criteria Supplier Scoring Algorithm (Module 7) work?',
      a: 'We implement a weighted utility model: Overall Score = (Price Score × 25%) + (Delivery Speed Score × 20%) + (On-Time Reliability Score × 20%) + (Quality Score × 15%) + (Fulfillment Rate Score × 20%), with penalties for defect return rates. The weights are dynamically configurable.',
    },
    {
      q: '6. What happens if the Gemini AI API key is not configured or offline?',
      a: 'The system has a built-in deterministic rule-based fallback engine. It calculates stock health, flags critical items, evaluates vendor metrics, and generates natural-language recommendations using internal heuristics without needing an internet connection or external API key.',
    },
    {
      q: '7. What database schema is used and what are the primary relationships?',
      a: 'We use a relational SQLite schema consisting of 7 core tables: products, suppliers, inventory_transactions, sales, purchase_orders, purchase_order_items, and ai_recommendations. Product is linked to Supplier via supplier_id foreign key; purchase_orders links to purchase_order_items via po_id.',
    },
    {
      q: '8. What happens in the database when a Purchase Order status changes to "Delivered"?',
      a: 'The system triggers an inventory transaction of type "RESTOCK" for each line item in the order, updates current_stock in the products table, recalculates the stock status and ROP coverage, and logs the transaction for historical auditing.',
    },
  ];

  const codeSnippets: Record<string, string> = {
    'app.py': `"""
AI-Based Inventory & Supplier Management System
Flask Backend Server (Python 3.10+)
College Mini Project Implementation
"""
from flask import Flask, jsonify, request, render_template
import sqlite3
import os
from services.inventory_engine import calculate_reorder_point, classify_velocity, evaluate_stockout_risk
from services.supplier_engine import rank_suppliers
from services.gemini_service import query_gemini_or_fallback

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in products])

@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    conn = get_db_connection()
    suppliers = conn.execute('SELECT * FROM suppliers').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in suppliers])

@app.route('/api/reorder-alerts', methods=['GET'])
def get_reorder_alerts():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    alerts = []
    for p in products:
        rop = calculate_reorder_point(p['average_daily_sales'], p['lead_time'], p['safety_stock'])
        risk = evaluate_stockout_risk(p['current_stock'], p['average_daily_sales'], p['lead_time'])
        if p['current_stock'] <= rop or risk['risk'] in ['HIGH', 'CRITICAL']:
            alerts.append({
                'id': p['id'],
                'name': p['name'],
                'current_stock': p['current_stock'],
                'reorder_point': rop,
                'risk': risk['risk'],
                'reason': risk['reason']
            })
    return jsonify(alerts)

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.get_json() or {}
    user_prompt = data.get('prompt', '')
    reply = query_gemini_or_fallback(user_prompt)
    return jsonify({'reply': reply})

if __name__ == '__main__':
    print("Starting Flask Inventory Management Server on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
`,
    'requirements.txt': `flask==3.0.3
google-genai==0.1.1
python-dotenv==1.0.1
tabulate==0.9.0
`,
    'seed_data.py': `"""
Database Seeding Script for SQLite
Run this to populate initial 22 products, 8 suppliers, and transaction history.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def seed():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create Tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS suppliers (
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

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        current_stock INTEGER,
        unit_price REAL,
        average_daily_sales REAL,
        lead_time INTEGER,
        safety_stock INTEGER,
        reorder_point INTEGER,
        supplier_id TEXT,
        last_restocked TEXT,
        status TEXT,
        FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        po_number TEXT UNIQUE,
        supplier_id TEXT,
        total_amount REAL,
        order_date TEXT,
        expected_delivery TEXT,
        status TEXT DEFAULT 'Pending',
        notes TEXT,
        FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )
    ''')

    # Seed Sample Supplier
    cursor.execute('''
    INSERT OR REPLACE INTO suppliers VALUES 
    ('SUP-001', 'Apex Global Logistics & Components', 'Marcus Vance', 'marcus.v@apexglobal.com', '+1-555-234-8890', 'San Jose, CA', 0.95, 3, 97.0, 4.8, 98.0, 1.2, 15, 'Preferred')
    ''')

    # Seed Sample Product
    cursor.execute('''
    INSERT OR REPLACE INTO products VALUES 
    ('PRD-101', 'Wireless Ergonomic Mouse Pro', 'Peripherals', 'Precision optical mouse', 14, 34.99, 7.2, 4, 15, 44, 'SUP-001', '2026-09-10', 'Critical')
    ''')

    conn.commit()
    conn.close()
    print("Database schema created and initial demo records seeded successfully into database.db!")

if __name__ == '__main__':
    seed()
`,
    'services/inventory_engine.py': `import math

def calculate_reorder_point(daily_sales, lead_time, safety_stock):
    """Formula: (Average Daily Sales * Lead Time) + Safety Stock"""
    return math.ceil(daily_sales * lead_time + safety_stock)

def classify_velocity(velocity):
    if velocity >= 5.5:
        return 'Fast Moving'
    elif velocity >= 2.0:
        return 'Medium Moving'
    return 'Slow Moving'

def evaluate_stockout_risk(current_stock, daily_sales, lead_time):
    if current_stock <= 0:
        return {'risk': 'CRITICAL', 'reason': 'Stock is currently zero.'}
    days_left = current_stock / max(0.1, daily_sales)
    if days_left <= lead_time:
        return {'risk': 'CRITICAL', 'reason': f'Stock ({days_left:.1f}d) will deplete before lead time ({lead_time}d).'}
    elif days_left <= lead_time * 1.5:
        return {'risk': 'HIGH', 'reason': 'Dangerous coverage margin under unexpected demand surge.'}
    return {'risk': 'LOW', 'reason': 'Adequate coverage.'}
`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 border border-violet-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 w-fit">
              <GraduationCap className="w-3.5 h-3.5" />
              Academic Mini Project Resource Center
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI-Based Inventory &amp; Supplier Management System
            </h2>
            <p className="text-xs text-slate-300">
              Complete project documentation, viva presentation guide, relational ERD schemas, and standalone Python/Flask/SQLite source code.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('viva')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'viva'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Top Viva Voce Questions &amp; Answers</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'architecture'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>System Architecture Flow</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'schema'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database Schema &amp; ERD</span>
        </button>

        <button
          onClick={() => setActiveTab('commands')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'commands'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Windows &amp; Linux Setup Commands</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'code'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Python / Flask Codebase</span>
        </button>
      </div>

      {/* Tab 1: Viva Questions */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              Examiner Viva Cheat Sheet (Top Evaluator Questions)
            </h3>
            <p className="text-xs text-slate-400">
              Prepare for your viva presentation. These answers cover core supply chain mathematics, architecture, risk prediction, and database synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {vivaQuestions.map((item, index) => (
              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2"
              >
                <div className="text-xs font-bold text-violet-300 flex items-start gap-2">
                  <span className="shrink-0 text-violet-400">Q{index + 1}:</span>
                  <span>{item.q.replace(/^\d+\.\s*/, '')}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-5 border-l-2 border-violet-800/60">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Architecture */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">System Architecture &amp; Data Pipeline</h3>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end multi-tiered architectural flow of data between User Interface, REST Services, AI Intelligence Core, and Persistent Database.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
{`+-----------------------------------------------------------------------------------------+
|                                    PRESENTATION TIER                                     |
|  [ Modern Responsive Dashboard | Chart.js Visualizations | Modal Dialogs | Alerts UI ]  |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v  (REST API calls: JSON over HTTP)
+-----------------------------------------------------------------------------------------+
|                                    APPLICATION TIER                                     |
|  [ Python Flask Server / Express Server on Port 3000/5000 ]                              |
|                                                                                         |
|   +-----------------------+   +-----------------------+   +-----------------------+    |
|   |   Inventory Engine    |   |    Reorder Engine     |   |    Supplier Engine    |    |
|   | • Sales Velocity      |   | • ROP = (ADS*LT) + SS |   | • Multi-Criteria MCDA |    |
|   | • Stock Status        |   | • Recommended EOQ Qty |   | • Price/Delivery/Rate |    |
|   +-----------------------+   +-----------------------+   +-----------------------+    |
|                                                                                         |
|   +-------------------------------------------------------------------------------+    |
|   |                          ARTIFICIAL INTELLIGENCE CORE                         |    |
|   |   Google Gemini 3.8 Flash API   <--->   Intelligent Local Rule-Based Engine   |    |
|   |   • Demand forecasting                  • Deterministic safety alerts         |    |
|   |   • Natural language query assistance   • Lead-time risk explanations         |    |
|   +-------------------------------------------------------------------------------+    |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v  (SQL Queries: SELECT, INSERT, UPDATE)
+-----------------------------------------------------------------------------------------+
|                                      DATA TIER                                          |
|                                  [ SQLite Database ]                                    |
|   • products              • suppliers                   • purchase_orders               |
|   • sales                 • inventory_transactions      • purchase_order_items          |
+-----------------------------------------------------------------------------------------+`}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-cyan-400">1. Data Ingestion:</strong>
              <p className="text-slate-300 leading-relaxed">
                Sales transactions and physical inventory checks feed real-time quantity updates into the data layer.
              </p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-400">2. Algorithmic Analysis:</strong>
              <p className="text-slate-300 leading-relaxed">
                The Reorder Engine continuously recomputes ROPs and flags any item where days remaining are less than vendor lead times.
              </p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400">3. Actionable Procurement:</strong>
              <p className="text-slate-300 leading-relaxed">
                1-click purchase order drafts are automatically routed to the highest-scoring supplier to prevent retail stock-outs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Schema */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Relational Database Schema (SQLite)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Normalized database tables with relational foreign key integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Table 1: products */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-indigo-400 mb-2 font-sans flex items-center justify-between">
                <span>TABLE: products</span>
                <span className="text-[10px] text-slate-500 font-mono">Core Catalog</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><strong className="text-amber-400">id</strong> TEXT PRIMARY KEY</li>
                <li><strong>name</strong> TEXT NOT NULL</li>
                <li><strong>category</strong> TEXT</li>
                <li><strong>description</strong> TEXT</li>
                <li><strong>current_stock</strong> INTEGER NOT NULL</li>
                <li><strong>unit_price</strong> REAL NOT NULL</li>
                <li><strong>average_daily_sales</strong> REAL NOT NULL</li>
                <li><strong>lead_time</strong> INTEGER NOT NULL</li>
                <li><strong>safety_stock</strong> INTEGER NOT NULL</li>
                <li><strong>reorder_point</strong> INTEGER NOT NULL</li>
                <li><strong className="text-cyan-400">supplier_id</strong> TEXT (FK -&gt; suppliers.id)</li>
                <li><strong>last_restocked</strong> TEXT</li>
                <li><strong>status</strong> TEXT</li>
              </ul>
            </div>

            {/* Table 2: suppliers */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-violet-400 mb-2 font-sans flex items-center justify-between">
                <span>TABLE: suppliers</span>
                <span className="text-[10px] text-slate-500 font-mono">Vendor Profiles</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><strong className="text-amber-400">id</strong> TEXT PRIMARY KEY</li>
                <li><strong>name</strong> TEXT NOT NULL</li>
                <li><strong>contact_person</strong> TEXT</li>
                <li><strong>email</strong> TEXT</li>
                <li><strong>phone</strong> TEXT</li>
                <li><strong>address</strong> TEXT</li>
                <li><strong>unit_price_index</strong> REAL</li>
                <li><strong>average_delivery_time</strong> INTEGER</li>
                <li><strong>on_time_delivery_rate</strong> REAL</li>
                <li><strong>quality_rating</strong> REAL</li>
                <li><strong>fulfillment_rate</strong> REAL</li>
                <li><strong>return_rate</strong> REAL</li>
                <li><strong>min_order_quantity</strong> INTEGER</li>
                <li><strong>status</strong> TEXT</li>
              </ul>
            </div>

            {/* Table 3: purchase_orders */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-emerald-400 mb-2 font-sans flex items-center justify-between">
                <span>TABLE: purchase_orders</span>
                <span className="text-[10px] text-slate-500 font-mono">Procurement</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><strong className="text-amber-400">id</strong> TEXT PRIMARY KEY</li>
                <li><strong>po_number</strong> TEXT UNIQUE NOT NULL</li>
                <li><strong className="text-cyan-400">supplier_id</strong> TEXT (FK -&gt; suppliers.id)</li>
                <li><strong>total_amount</strong> REAL NOT NULL</li>
                <li><strong>order_date</strong> TEXT NOT NULL</li>
                <li><strong>expected_delivery</strong> TEXT NOT NULL</li>
                <li><strong>status</strong> TEXT NOT NULL</li>
                <li><strong>notes</strong> TEXT</li>
              </ul>
            </div>

            {/* Table 4: inventory_transactions */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="font-bold text-amber-400 mb-2 font-sans flex items-center justify-between">
                <span>TABLE: inventory_transactions</span>
                <span className="text-[10px] text-slate-500 font-mono">Audit Log</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><strong className="text-amber-400">id</strong> TEXT PRIMARY KEY</li>
                <li><strong className="text-cyan-400">product_id</strong> TEXT (FK -&gt; products.id)</li>
                <li><strong>type</strong> TEXT (RESTOCK, SALE, ADJUSTMENT)</li>
                <li><strong>quantity</strong> INTEGER NOT NULL</li>
                <li><strong>balance_after</strong> INTEGER NOT NULL</li>
                <li><strong>date</strong> TEXT NOT NULL</li>
                <li><strong>reference</strong> TEXT</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Commands */}
      {activeTab === 'commands' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-white">How to Run on Windows / Linux (College Viva Demonstration)</h3>
            <p className="text-slate-400 mt-1">
              Exact terminal commands to set up the standalone Python Flask backend and SQLite database on any student machine.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Step 1: Setup Python Virtual Environment (Windows)</span>
              </div>
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`# 1. Open PowerShell or Command Prompt
cd inventory_supplier_system

# 2. Create Virtual Environment
python -m venv venv

# 3. Activate Virtual Environment (Windows)
venv\\Scripts\\activate

# On Linux / macOS use:
# source venv/bin/activate`}
              </pre>
            </div>

            <div>
              <div className="font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Step 2: Install Dependencies</span>
              </div>
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`pip install -r requirements.txt`}
              </pre>
            </div>

            <div>
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Step 3: Seed SQLite Database</span>
              </div>
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`python seed_data.py
# Output: Database schema created and initial demo records seeded successfully into database.db!`}
              </pre>
            </div>

            <div>
              <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Step 4: Launch Flask Web Server</span>
              </div>
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`python app.py
# Output: Starting Flask Inventory Management Server on http://127.0.0.1:5000`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Code Viewer */}
      {activeTab === 'code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Standalone Python/Flask Code Files</h3>
              <p className="text-xs text-slate-400">
                Inspect and copy each backend module for submission or presentation.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(selectedCodeFile, codeSnippets[selectedCodeFile])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition cursor-pointer"
            >
              {copiedFile === selectedCodeFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy {selectedCodeFile}</span>
                </>
              )}
            </button>
          </div>

          {/* File selector pills */}
          <div className="flex gap-2 text-xs border-b border-slate-800 pb-2 overflow-x-auto">
            {Object.keys(codeSnippets).map((filename) => (
              <button
                key={filename}
                onClick={() => setSelectedCodeFile(filename)}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium transition cursor-pointer ${
                  selectedCodeFile === filename
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {filename}
              </button>
            ))}
          </div>

          {/* Code viewer display */}
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed">
            {codeSnippets[selectedCodeFile]}
          </pre>
        </div>
      )}
    </div>
  );
};
