class PurchaseOrderModel:
    @staticmethod
    def get_all(conn):
        cursor = conn.cursor()
        cursor.execute('''
            SELECT po.*, s.name as supplier_name 
            FROM purchase_orders po
            LEFT JOIN suppliers s ON po.supplier_id = s.id
            ORDER BY po.order_date DESC
        ''')
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def create(conn, data):
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO purchase_orders (
                id, po_number, supplier_id, total_amount, order_date, expected_delivery, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'], data['po_number'], data['supplier_id'],
            data['total_amount'], data['order_date'], data['expected_delivery'],
            data.get('status', 'Pending'), data.get('notes', '')
        ))
        conn.commit()
        return data['id']

    @staticmethod
    def update_status(conn, po_id, status):
        cursor = conn.cursor()
        cursor.execute("UPDATE purchase_orders SET status = ? WHERE id = ?", (status, po_id))
        conn.commit()
