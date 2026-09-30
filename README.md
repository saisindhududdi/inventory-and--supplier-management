# AI-Based Inventory & Supplier Management System

A college mini project engineering a full-stack, AI-powered retail supply chain application designed to automate inventory monitoring, dynamically calculate Reorder Points (ROP), evaluate stock-out risk coverage, score and rank suppliers using multi-criteria decision models, and generate automated purchase orders.

---

## 1. Problem Statement
Retail chains frequently suffer from stock-outs of fast-moving products and excessive carrying costs for slow-moving goods because inventory tracking and supplier selection are often handled manually or via static spreadsheets. Employees fail to detect critical stock depletions in time, reorder from suboptimal or unreliable suppliers, and spend valuable hours manually analyzing purchase logs.

---

## 2. Main Objectives
1. **Automated Inventory Tracking**: Real-time visibility into stock balances across categories.
2. **Sales Velocity Classification**: Automatic calculation of daily sales velocity to categorize items as Fast Moving, Medium Moving, or Slow Moving.
3. **Dynamic Reorder Engine**: Algorithmic computation of Reorder Points:
   $$\text{ROP} = (\text{Average Daily Demand} \times \text{Lead Time}) + \text{Safety Stock}$$
4. **Stock-Out Risk Prediction**: Comparing remaining stock coverage days with vendor delivery times to anticipate stock depletion before arrival.
5. **AI Supplier Scoring (MCDA)**: Multi-criteria weighted utility scoring evaluating Price (25%), Delivery Speed (20%), On-Time Reliability (20%), Quality Rating (15%), and Fulfillment Ratio (20%).
6. **Automated Purchase Orders**: Generating 1-click Draft POs from critical replenishment alerts with automatic restock upon delivery.
7. **Conversational AI Assistant**: Natural language question-answering powered by Google Gemini (with an intelligent rule-based offline fallback).

---

## 3. Technology Stack

### Presentation Layer
- **HTML5, CSS3, Vanilla JavaScript**
- **Modern Responsive Dashboard** with Chart.js Canvas visualizations, KPI cards, and modal dialogs.
- **AI Studio Web Interface**: React SPA with Tailwind CSS running on port 3000.

### Application / Server Layer
- **Python 3.10+ with Flask Framework**
- **Node.js / Express Server** with `@google/genai` TypeScript SDK.

### Database Layer
- **SQLite3 Relational Database**: Structured schemas (`products`, `suppliers`, `purchase_orders`, `inventory_transactions`, `sales`).

### Artificial Intelligence & Machine Learning
- **Google Gemini API** (`gemini-3.8-flash`) for strategic demand auditing and conversational assistance.
- **Intelligent Heuristic Fallback Engine** ensuring 100% functionality without an API key or when offline.

---

## 4. System Architecture
```text
+-----------------------------------------------------------------------------------------+
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
+-----------------------------------------------------------------------------------------+
```

---

## 5. Relational Database Schema

### Table: `products`
| Column | Type | Description |
|---|---|---|
| `id` | TEXT PRIMARY KEY | Unique Product SKU (e.g. PRD-101) |
| `name` | TEXT NOT NULL | Product Title |
| `category` | TEXT | Peripherals, Electronics, Storage, etc. |
| `current_stock` | INTEGER | Current physical stock count in units |
| `unit_price` | REAL | Selling unit price |
| `average_daily_sales` | REAL | Daily consumption demand velocity |
| `lead_time` | INTEGER | Days supplier takes to ship & deliver |
| `safety_stock` | INTEGER | Buffer stock to absorb supply delays |
| `reorder_point` | INTEGER | Dynamic threshold: `(ADS * Lead) + Safety` |
| `supplier_id` | TEXT (FK) | Reference to `suppliers.id` |
| `status` | TEXT | Healthy, Low Stock, Critical, Out of Stock |

### Table: `suppliers`
| Column | Type | Description |
|---|---|---|
| `id` | TEXT PRIMARY KEY | Supplier Identifier (e.g. SUP-001) |
| `name` | TEXT NOT NULL | Supplier Company Name |
| `unit_price_index` | REAL | Price competitiveness index (1.0 = standard) |
| `average_delivery_time`| INTEGER | Average turnaround time in days |
| `on_time_delivery_rate`| REAL | On-time delivery percentage (0-100%) |
| `quality_rating` | REAL | 1.0 to 5.0 star quality rating |
| `fulfillment_rate` | REAL | Order fulfillment accuracy % |
| `return_rate` | REAL | Defect return percentage |

---

## 6. Mathematical Formulas & Business Logic

### 1. Daily Sales Velocity
$$\text{Sales Velocity} = \frac{\text{Total Units Sold (over } N \text{ days)}}{N}$$
- **Fast Moving**: $\ge 5.5\text{ units/day}$
- **Medium Moving**: $2.0 \text{ to } 5.4\text{ units/day}$
- **Slow Moving**: $< 2.0\text{ units/day}$

### 2. Reorder Point (ROP)
$$\text{Reorder Point} = (\text{Average Daily Demand} \times \text{Lead Time}) + \text{Safety Stock}$$

### 3. Days of Stock Remaining
$$\text{Days Remaining} = \frac{\text{Current Stock}}{\text{Average Daily Sales}}$$

### 4. Stock-Out Risk Classification
- **CRITICAL**: $\text{Days Remaining} \le \text{Supplier Lead Time}$ (Stockout guaranteed before arrival)
- **HIGH**: $\text{Days Remaining} \le 1.5 \times \text{Lead Time}$
- **MEDIUM**: $\text{Days Remaining} \le 2.5 \times \text{Lead Time}$
- **LOW**: $\text{Days Remaining} > 2.5 \times \text{Lead Time}$

### 5. Multi-Criteria Supplier Composite Score
$$\text{Score} = (W_P \times S_{\text{Price}}) + (W_D \times S_{\text{Delivery}}) + (W_R \times S_{\text{Reliability}}) + (W_Q \times S_{\text{Quality}}) + (W_F \times S_{\text{Fulfillment}})$$
*Default Weights*: Price 25%, Delivery 20%, Reliability 20%, Quality 15%, Fulfillment 20%.

---

## 7. How to Install and Run

### Running in Google AI Studio
The interactive application starts automatically on port 3000. It includes the full React/Tailwind frontend, Express server, Gemini 3.8 Flash connectivity, and an in-app "Mini Project Hub" tab.

### Running Standalone Python / Flask on Windows

```bash
# 1. Open Windows Command Prompt or PowerShell
cd inventory_supplier_system

# 2. Create a virtual environment
python -m venv venv

# 3. Activate the virtual environment
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Seed the SQLite database with 22 products and 8 suppliers
python seed_data.py

# 6. (Optional) Set your Gemini API key in .env
# If omitted, the intelligent rule-based fallback engine will run automatically!
# copy .env.example .env

# 7. Start the Flask server
python app.py
```
Open your browser to: **`http://127.0.0.1:5000`**

### Running on Linux / macOS

```bash
cd inventory_supplier_system
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 seed_data.py
python3 app.py
```

---

## 8. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve all catalog products with current stock |
| `POST` | `/api/products` | Add a new product (calculates ROP & Status) |
| `PUT` | `/api/products/<id>` | Update an existing product |
| `DELETE`| `/api/products/<id>` | Delete a product from inventory |
| `GET` | `/api/suppliers` | Retrieve list of all suppliers |
| `POST` | `/api/suppliers` | Register a new supplier profile |
| `GET` | `/api/inventory/alerts`| Fetch products at or below ROP & critical risk |
| `GET` | `/api/recommendations` | Get ranked suppliers via multi-criteria MCDA |
| `GET` | `/api/purchase-orders` | Retrieve purchase order records |
| `POST` | `/api/purchase-orders` | Create a new purchase order |
| `PUT` | `/api/purchase-orders/<id>/status` | Update PO status (Delivered triggers auto-restock) |
| `POST` | `/api/ai/chat` | Natural-language conversational AI assistant |

---

## 9. Viva Voce Cheat Sheet for Students

1. **Why is safety stock added to the reorder point?**
   *Answer*: Safety stock acts as a protective buffer against unexpected demand surges during the replenishment cycle or transport delivery delays from the vendor.

2. **How does the system prevent stock-outs?**
   *Answer*: By constantly comparing calculated "Days of Stock Remaining" against the vendor's actual delivery lead time. If days remaining are less than the lead time, the system flags a CRITICAL stock-out risk and prepares an emergency draft purchase order.

3. **How does the AI fallback work?**
   *Answer*: If an external Gemini API key is not present or the internet connection drops, the system uses deterministic rule-based algorithms to compute velocity, reorder thresholds, vendor scores, and natural language explanations.

---

## 10. Future Enhancements
- Integration with barcode and RFID scanning hardware.
- Multi-warehouse distributed inventory transfer balancing.
- Machine-learning seasonal autoregressive forecasting (ARIMA / LSTM).
- Direct EDI (Electronic Data Interchange) transmission to supplier ERP systems.
