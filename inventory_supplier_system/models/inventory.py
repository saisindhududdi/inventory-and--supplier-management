class InventoryTransactionModel:
    @staticmethod
    def get_all(conn, limit=50):
        cursor = conn.cursor()
        cursor.execute('''
            SELECT it.*, p.name as product_name
            FROM inventory_transactions it
            LEFT JOIN products p ON it.product_id = p.id
            ORDER BY it.date DESC LIMIT ?
        ''', (limit,))
        return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def log_transaction(conn, product_id, tx_type, quantity, balance_after, reference=''):
        cursor = conn.cursor()
        tx_id = f"TRX-{int(conn.execute('SELECT COUNT(*) FROM inventory_transactions').fetchone()[0]) + 1000}"
        cursor.execute('''
            INSERT INTO inventory_transactions (id, product_id, type, quantity, balance_after, date, reference)
            VALUES (?, ?, ?, ?, ?, DATE('now'), ?)
        ''', (tx_id, product_id, tx_type, quantity, balance_after, reference))
        conn.commit()
        return tx_id
