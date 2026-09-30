import sys
import os

# Add inventory_supplier_system directory to sys.path so its modules can be imported
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
inventory_dir = os.path.join(parent_dir, 'inventory_supplier_system')
if inventory_dir not in sys.path:
    sys.path.insert(0, inventory_dir)

from app import app
