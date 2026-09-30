class SupplierModel:
    @staticmethod
    def get_all(conn):
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM suppliers ORDER BY name ASC")
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def get_by_id(conn, supplier_id):
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM suppliers WHERE id = ?", (supplier_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

    @staticmethod
    def create(conn, data):
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO suppliers (
                id, name, contact_person, email, phone, address,
                unit_price_index, average_delivery_time, on_time_delivery_rate,
                quality_rating, fulfillment_rate, return_rate, min_order_quantity, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['id'], data['name'], data.get('contact_person', ''),
            data.get('email', ''), data.get('phone', ''), data.get('address', ''),
            data.get('unit_price_index', 1.0), data.get('average_delivery_time', 4),
            data.get('on_time_delivery_rate', 95.0), data.get('quality_rating', 4.5),
            data.get('fulfillment_rate', 95.0), data.get('return_rate', 1.5),
            data.get('min_order_quantity', 10), data.get('status', 'Active')
        ))
        conn.commit()
        return data['id']

    @staticmethod
    def update(conn, supplier_id, data):
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE suppliers SET
                name = ?, contact_person = ?, email = ?, phone = ?, address = ?,
                unit_price_index = ?, average_delivery_time = ?, on_time_delivery_rate = ?,
                quality_rating = ?, fulfillment_rate = ?, return_rate = ?,
                min_order_quantity = ?, status = ?
            WHERE id = ?
        ''', (
            data['name'], data.get('contact_person', ''), data.get('email', ''),
            data.get('phone', ''), data.get('address', ''), data.get('unit_price_index', 1.0),
            data.get('average_delivery_time', 4), data.get('on_time_delivery_rate', 95.0),
            data.get('quality_rating', 4.5), data.get('fulfillment_rate', 95.0),
            data.get('return_rate', 1.5), data.get('min_order_quantity', 10),
            data.get('status', 'Active'), supplier_id
        ))
        conn.commit()

    @staticmethod
    def delete(conn, supplier_id):
        cursor = conn.cursor()
        cursor.execute("DELETE FROM suppliers WHERE id = ?", (supplier_id,))
        conn.commit()
