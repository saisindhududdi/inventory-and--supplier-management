import sqlite3

class ProductModel:
    @staticmethod
    def get_all(conn):
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products ORDER BY name ASC")
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def get_by_id(conn, product_id):
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

    @staticmethod
    def create(conn, data):
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO products (
                id, name, category, description, current_stock, unit_price,
                average_daily_sales, lead_time, safety_stock, reorder_point,
                supplier_id, last_restocked, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'], data['name'], data.get('category', 'General'),
            data.get('description', ''), data['current_stock'], data['unit_price'],
            data['average_daily_sales'], data['lead_time'], data['safety_stock'],
            data['reorder_point'], data['supplier_id'], data.get('last_restocked', ''),
            data.get('status', 'Healthy')
        ))
        conn.commit()
        return data['id']

    @staticmethod
    def update(conn, product_id, data):
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE products SET
                name = ?, category = ?, description = ?, current_stock = ?,
                unit_price = ?, average_daily_sales = ?, lead_time = ?,
                safety_stock = ?, reorder_point = ?, supplier_id = ?,
                last_restocked = ?, status = ?
            WHERE id = ?
        ''', (
            data['name'], data['category'], data.get('description', ''),
            data['current_stock'], data['unit_price'], data['average_daily_sales'],
            data['lead_time'], data['safety_stock'], data['reorder_point'],
            data['supplier_id'], data['last_restocked'], data['status'], product_id
        ))
        conn.commit()

    @staticmethod
    def delete(conn, product_id):
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
