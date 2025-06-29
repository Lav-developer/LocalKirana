#!/usr/bin/env python3
import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse
from datetime import datetime
import threading
import time
import hashlib

# Data storage files
STORES_FILE = 'data/stores.json'
CUSTOMERS_FILE = 'data/customers.json'
BOOKINGS_FILE = 'data/bookings.json'
REQUESTS_FILE = 'data/requests.json'
CHATS_FILE = 'data/chats.json'

class LocalKiranaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        if self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            self.handle_api_post()
        else:
            self.send_error(404)
    
    def handle_api_get(self):
        if self.path == '/api/stores':
            self.get_stores()
        elif self.path == '/api/bookings':
            self.get_bookings()
        elif self.path == '/api/requests':
            self.get_requests()
        elif self.path == '/api/customers':
            self.get_customers()
        elif self.path == '/api/chats':
            self.get_chats()
        else:
            self.send_error(404)
    
    def handle_api_post(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_json_response({'success': False, 'message': 'Invalid JSON'}, 400)
            return
        
        if self.path == '/api/register-shop':
            self.register_shop(data)
        elif self.path == '/api/customer-register':
            self.register_customer(data)
        elif self.path == '/api/customer-login':
            self.login_customer(data)
        elif self.path == '/api/shopkeeper-login':
            self.login_shopkeeper(data)
        elif self.path == '/api/book-item':
            self.book_item(data)
        elif self.path == '/api/request-item':
            self.request_item(data)
        elif self.path == '/api/update-store':
            self.update_store(data)
        elif self.path == '/api/update-customer':
            self.update_customer(data)
        elif self.path == '/api/add-product':
            self.add_product(data)
        elif self.path == '/api/update-product':
            self.update_product(data)
        elif self.path == '/api/delete-product':
            self.delete_product(data)
        elif self.path == '/api/update-booking-status':
            self.update_booking_status(data)
        elif self.path == '/api/save-chat':
            self.save_chat(data)
        else:
            self.send_error(404)
    
    def hash_password(self, password):
        """Simple password hashing using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def register_customer(self, data):
        customers = self.load_data(CUSTOMERS_FILE, [])
        
        # Check if customer already exists
        for customer in customers:
            if customer['phone'] == data['phone']:
                self.send_json_response({'success': False, 'message': 'Phone number already registered'})
                return
            if customer['email'] == data['email']:
                self.send_json_response({'success': False, 'message': 'Email already registered'})
                return
        
        # Hash password and add customer
        data['id'] = len(customers) + 1
        data['password'] = self.hash_password(data['password'])
        data['registrationDate'] = datetime.now().isoformat()
        data['status'] = 'active'
        
        customers.append(data)
        
        if self.save_data(CUSTOMERS_FILE, customers):
            self.send_json_response({'success': True, 'message': 'Customer registered successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to register customer'}, 500)
    
    def login_customer(self, data):
        customers = self.load_data(CUSTOMERS_FILE, [])
        phone = data.get('phone')
        password = self.hash_password(data.get('password', ''))
        
        for customer in customers:
            if customer['phone'] == phone and customer['password'] == password:
                # Remove password from response
                customer_data = customer.copy()
                del customer_data['password']
                self.send_json_response({'success': True, 'user': customer_data})
                return
        
        self.send_json_response({'success': False, 'message': 'Invalid phone number or password'})
    
    def login_shopkeeper(self, data):
        stores = self.load_data(STORES_FILE, [])
        phone = data.get('phone')
        password = self.hash_password(data.get('password', ''))
        
        for store in stores:
            if store['phone'] == phone and store.get('password') == password:
                # Remove password from response
                store_data = store.copy()
                if 'password' in store_data:
                    del store_data['password']
                self.send_json_response({'success': True, 'user': store_data})
                return
        
        self.send_json_response({'success': False, 'message': 'Invalid phone number or password'})
    
    def get_stores(self):
        stores = self.load_data(STORES_FILE, [])
        # Remove passwords from response
        safe_stores = []
        for store in stores:
            safe_store = store.copy()
            if 'password' in safe_store:
                del safe_store['password']
            safe_stores.append(safe_store)
        self.send_json_response({'success': True, 'stores': safe_stores})
    
    def get_customers(self):
        customers = self.load_data(CUSTOMERS_FILE, [])
        # Remove passwords from response
        safe_customers = []
        for customer in customers:
            safe_customer = customer.copy()
            if 'password' in safe_customer:
                del safe_customer['password']
            safe_customers.append(safe_customer)
        self.send_json_response({'success': True, 'customers': safe_customers})
    
    def register_shop(self, data):
        stores = self.load_data(STORES_FILE, [])
        
        # Check if shop already exists
        for store in stores:
            if store['phone'] == data['phone']:
                self.send_json_response({'success': False, 'message': 'Phone number already registered'})
                return
            if store['email'] == data['email']:
                self.send_json_response({'success': False, 'message': 'Email already registered'})
                return
        
        # Generate unique ID and hash password
        data['id'] = len(stores) + 1
        data['password'] = self.hash_password(data['password'])
        data['registrationDate'] = datetime.now().isoformat()
        data['status'] = 'active'
        
        # Add default products if not provided
        if 'products' not in data:
            data['products'] = self.get_default_products(data.get('category', 'general'))
        
        stores.append(data)
        
        if self.save_data(STORES_FILE, stores):
            self.send_json_response({'success': True, 'message': 'Shop registered successfully', 'shop_id': data['id']})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to save shop data'}, 500)
    
    def book_item(self, data):
        bookings = self.load_data(BOOKINGS_FILE, [])
        
        data['id'] = len(bookings) + 1
        data['bookingDate'] = datetime.now().isoformat()
        data['status'] = 'pending'
        
        bookings.append(data)
        
        if self.save_data(BOOKINGS_FILE, bookings):
            self.send_json_response({'success': True, 'message': 'Item booked successfully', 'booking_id': data['id']})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to save booking'}, 500)
    
    def request_item(self, data):
        requests = self.load_data(REQUESTS_FILE, [])
        
        data['id'] = len(requests) + 1
        data['requestDate'] = datetime.now().isoformat()
        data['status'] = 'pending'
        
        requests.append(data)
        
        if self.save_data(REQUESTS_FILE, requests):
            # Notify relevant shopkeepers (in a real app, this would send notifications)
            self.notify_shopkeepers(data)
            self.send_json_response({'success': True, 'message': 'Item request sent successfully', 'request_id': data['id']})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to save request'}, 500)
    
    def update_store(self, data):
        stores = self.load_data(STORES_FILE, [])
        
        store_id = data.get('id')
        if not store_id:
            self.send_json_response({'success': False, 'message': 'Store ID required'}, 400)
            return
        
        # Find and update store
        for i, store in enumerate(stores):
            if store['id'] == store_id:
                # Don't allow password changes through this endpoint
                if 'password' in data:
                    del data['password']
                stores[i].update(data)
                if self.save_data(STORES_FILE, stores):
                    self.send_json_response({'success': True, 'message': 'Store updated successfully'})
                else:
                    self.send_json_response({'success': False, 'message': 'Failed to update store'}, 500)
                return
        
        self.send_json_response({'success': False, 'message': 'Store not found'}, 404)
    
    def update_customer(self, data):
        customers = self.load_data(CUSTOMERS_FILE, [])
        
        customer_id = data.get('id')
        if not customer_id:
            self.send_json_response({'success': False, 'message': 'Customer ID required'}, 400)
            return
        
        # Find and update customer
        for i, customer in enumerate(customers):
            if customer['id'] == customer_id:
                # Don't allow password changes through this endpoint
                if 'password' in data:
                    del data['password']
                customers[i].update(data)
                if self.save_data(CUSTOMERS_FILE, customers):
                    self.send_json_response({'success': True, 'message': 'Customer updated successfully'})
                else:
                    self.send_json_response({'success': False, 'message': 'Failed to update customer'}, 500)
                return
        
        self.send_json_response({'success': False, 'message': 'Customer not found'}, 404)
    
    def add_product(self, data):
        stores = self.load_data(STORES_FILE, [])
        store_id = data.get('storeId')
        product = data.get('product')
        
        if not store_id or not product:
            self.send_json_response({'success': False, 'message': 'Store ID and product data required'}, 400)
            return
        
        # Find store and add product
        for i, store in enumerate(stores):
            if store['id'] == store_id:
                if 'products' not in stores[i]:
                    stores[i]['products'] = []
                
                # Add unique ID to product
                product['id'] = len(stores[i]['products']) + 1
                stores[i]['products'].append(product)
                
                if self.save_data(STORES_FILE, stores):
                    self.send_json_response({'success': True, 'message': 'Product added successfully'})
                else:
                    self.send_json_response({'success': False, 'message': 'Failed to add product'}, 500)
                return
        
        self.send_json_response({'success': False, 'message': 'Store not found'}, 404)
    
    def update_product(self, data):
        stores = self.load_data(STORES_FILE, [])
        store_id = data.get('storeId')
        product_index = data.get('productIndex')
        product = data.get('product')
        
        if store_id is None or product_index is None or not product:
            self.send_json_response({'success': False, 'message': 'Store ID, product index, and product data required'}, 400)
            return
        
        # Find store and update product
        for i, store in enumerate(stores):
            if store['id'] == store_id:
                if 'products' in stores[i] and 0 <= product_index < len(stores[i]['products']):
                    # Keep the original ID
                    original_id = stores[i]['products'][product_index].get('id')
                    stores[i]['products'][product_index] = product
                    if original_id:
                        stores[i]['products'][product_index]['id'] = original_id
                    
                    if self.save_data(STORES_FILE, stores):
                        self.send_json_response({'success': True, 'message': 'Product updated successfully'})
                    else:
                        self.send_json_response({'success': False, 'message': 'Failed to update product'}, 500)
                    return
                else:
                    self.send_json_response({'success': False, 'message': 'Product not found'}, 404)
                    return
        
        self.send_json_response({'success': False, 'message': 'Store not found'}, 404)
    
    def delete_product(self, data):
        stores = self.load_data(STORES_FILE, [])
        store_id = data.get('storeId')
        product_index = data.get('productIndex')
        
        if store_id is None or product_index is None:
            self.send_json_response({'success': False, 'message': 'Store ID and product index required'}, 400)
            return
        
        # Find store and delete product
        for i, store in enumerate(stores):
            if store['id'] == store_id:
                if 'products' in stores[i] and 0 <= product_index < len(stores[i]['products']):
                    stores[i]['products'].pop(product_index)
                    
                    if self.save_data(STORES_FILE, stores):
                        self.send_json_response({'success': True, 'message': 'Product deleted successfully'})
                    else:
                        self.send_json_response({'success': False, 'message': 'Failed to delete product'}, 500)
                    return
                else:
                    self.send_json_response({'success': False, 'message': 'Product not found'}, 404)
                    return
        
        self.send_json_response({'success': False, 'message': 'Store not found'}, 404)
    
    def update_booking_status(self, data):
        bookings = self.load_data(BOOKINGS_FILE, [])
        booking_id = data.get('bookingId')
        status = data.get('status')
        
        if not booking_id or not status:
            self.send_json_response({'success': False, 'message': 'Booking ID and status required'}, 400)
            return
        
        # Find and update booking
        for i, booking in enumerate(bookings):
            if booking['id'] == booking_id:
                bookings[i]['status'] = status
                bookings[i]['statusUpdatedDate'] = datetime.now().isoformat()
                
                if self.save_data(BOOKINGS_FILE, bookings):
                    self.send_json_response({'success': True, 'message': 'Booking status updated successfully'})
                else:
                    self.send_json_response({'success': False, 'message': 'Failed to update booking status'}, 500)
                return
        
        self.send_json_response({'success': False, 'message': 'Booking not found'}, 404)
    
    def get_bookings(self):
        bookings = self.load_data(BOOKINGS_FILE, [])
        self.send_json_response({'success': True, 'bookings': bookings})
    
    def get_requests(self):
        requests = self.load_data(REQUESTS_FILE, [])
        self.send_json_response({'success': True, 'requests': requests})
    
    def get_chats(self):
        chats = self.load_data(CHATS_FILE, [])
        self.send_json_response({'success': True, 'chats': chats})
    
    def save_chat(self, data):
        chats = self.load_data(CHATS_FILE, [])
        
        # Find existing chat or add new one
        chat_found = False
        for i, chat in enumerate(chats):
            if chat['id'] == data['id']:
                chats[i] = data
                chat_found = True
                break
        
        if not chat_found:
            chats.append(data)
        
        if self.save_data(CHATS_FILE, chats):
            self.send_json_response({'success': True, 'message': 'Chat saved successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to save chat'}, 500)
    
    def notify_shopkeepers(self, request_data):
        """
        In a real application, this would send notifications to shopkeepers
        via email, SMS, or push notifications
        """
        stores = self.load_data(STORES_FILE, [])
        item_name = request_data.get('itemName', '').lower()
        
        # Find stores that might have the requested item
        relevant_stores = []
        for store in stores:
            for product in store.get('products', []):
                if item_name in product.get('name', '').lower():
                    relevant_stores.append(store)
                    break
        
        # Log notification (in real app, send actual notifications)
        print(f"Notification: Item '{request_data.get('itemName')}' requested by {request_data.get('customerName')}")
        print(f"Relevant stores: {[store['shopName'] for store in relevant_stores]}")
    
    def get_default_products(self, category):
        default_products = {
            'grocery': [
                {'id': 1, 'name': 'Rice (1kg)', 'price': '₹80', 'available': True},
                {'id': 2, 'name': 'Dal (1kg)', 'price': '₹120', 'available': True},
                {'id': 3, 'name': 'Oil (1L)', 'price': '₹150', 'available': True},
                {'id': 4, 'name': 'Sugar (1kg)', 'price': '₹45', 'available': True}
            ],
            'medical': [
                {'id': 1, 'name': 'Paracetamol', 'price': '₹25', 'available': True},
                {'id': 2, 'name': 'Cough Syrup', 'price': '₹85', 'available': True},
                {'id': 3, 'name': 'Bandages', 'price': '₹30', 'available': True},
                {'id': 4, 'name': 'Antiseptic', 'price': '₹45', 'available': True}
            ],
            'stationery': [
                {'id': 1, 'name': 'Notebook', 'price': '₹25', 'available': True},
                {'id': 2, 'name': 'Pen Set', 'price': '₹50', 'available': True},
                {'id': 3, 'name': 'Pencil Box', 'price': '₹75', 'available': True},
                {'id': 4, 'name': 'Eraser', 'price': '₹5', 'available': True}
            ],
            'electronics': [
                {'id': 1, 'name': 'Mobile Charger', 'price': '₹299', 'available': True},
                {'id': 2, 'name': 'Earphones', 'price': '₹599', 'available': True},
                {'id': 3, 'name': 'Power Bank', 'price': '₹1299', 'available': True},
                {'id': 4, 'name': 'Phone Case', 'price': '₹199', 'available': True}
            ],
            'general': [
                {'id': 1, 'name': 'Soap', 'price': '₹30', 'available': True},
                {'id': 2, 'name': 'Shampoo', 'price': '₹120', 'available': True},
                {'id': 3, 'name': 'Toothpaste', 'price': '₹45', 'available': True},
                {'id': 4, 'name': 'Detergent', 'price': '₹80', 'available': True}
            ]
        }
        
        return default_products.get(category, default_products['general'])
    
    def load_data(self, filename, default=None):
        if default is None:
            default = []
        
        try:
            if os.path.exists(filename):
                with open(filename, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return default
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading {filename}: {e}")
            return default
    
    def save_data(self, filename, data):
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except IOError as e:
            print(f"Error saving {filename}: {e}")
            return False
    
    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        response = json.dumps(data, ensure_ascii=False)
        self.wfile.write(response.encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

def create_sample_data():
    """Create sample data for demonstration"""
    sample_stores = [
        {
            'id': 1,
            'shopName': 'Sharma General Store',
            'ownerName': 'Raj Sharma',
            'phone': '+91 9876543210',
            'email': 'raj@sharma.com',
            'address': '123 Main Street, Sector 15',
            'pincode': '110001',
            'category': 'grocery',
            'status': 'active',
            'password': hashlib.sha256('password123'.encode()).hexdigest(),
            'registrationDate': '2025-01-01T00:00:00',
            'products': [
                {'id': 1, 'name': 'Rice (1kg)', 'price': '₹80', 'available': True},
                {'id': 2, 'name': 'Dal (1kg)', 'price': '₹120', 'available': True},
                {'id': 3, 'name': 'Oil (1L)', 'price': '₹150', 'available': True},
                {'id': 4, 'name': 'Sugar (1kg)', 'price': '₹45', 'available': False}
            ]
        },
        {
            'id': 2,
            'shopName': 'City Medical Store',
            'ownerName': 'Dr. Priya Patel',
            'phone': '+91 9876543211',
            'email': 'priya@citymedical.com',
            'address': '456 Health Plaza, Medical District',
            'pincode': '110002',
            'category': 'medical',
            'status': 'active',
            'password': hashlib.sha256('medical123'.encode()).hexdigest(),
            'registrationDate': '2025-01-01T00:00:00',
            'products': [
                {'id': 1, 'name': 'Paracetamol', 'price': '₹25', 'available': True},
                {'id': 2, 'name': 'Cough Syrup', 'price': '₹85', 'available': True},
                {'id': 3, 'name': 'Bandages', 'price': '₹30', 'available': True},
                {'id': 4, 'name': 'Thermometer', 'price': '₹200', 'available': True}
            ]
        },
        {
            'id': 3,
            'shopName': 'Tech Electronics Hub',
            'ownerName': 'Amit Kumar',
            'phone': '+91 9876543212',
            'email': 'amit@techhub.com',
            'address': '789 Electronics Market, Tech City',
            'pincode': '110003',
            'category': 'electronics',
            'status': 'active',
            'password': hashlib.sha256('tech123'.encode()).hexdigest(),
            'registrationDate': '2025-01-01T00:00:00',
            'products': [
                {'id': 1, 'name': 'Mobile Charger', 'price': '₹299', 'available': True},
                {'id': 2, 'name': 'Earphones', 'price': '₹599', 'available': True},
                {'id': 3, 'name': 'Power Bank', 'price': '₹1299', 'available': False},
                {'id': 4, 'name': 'Phone Case', 'price': '₹199', 'available': True}
            ]
        }
    ]
    
    sample_customers = [
        {
            'id': 1,
            'name': 'John Doe',
            'phone': '+91 9876543213',
            'email': 'john@example.com',
            'location': 'Sector 15, Delhi',
            'password': hashlib.sha256('customer123'.encode()).hexdigest(),
            'registrationDate': '2025-01-01T00:00:00',
            'status': 'active'
        }
    ]
    
    # Create data directory
    os.makedirs('data', exist_ok=True)
    
    # Save sample data if files don't exist
    if not os.path.exists(STORES_FILE):
        with open(STORES_FILE, 'w', encoding='utf-8') as f:
            json.dump(sample_stores, f, indent=2, ensure_ascii=False)
    
    if not os.path.exists(CUSTOMERS_FILE):
        with open(CUSTOMERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(sample_customers, f, indent=2, ensure_ascii=False)
    
    if not os.path.exists(BOOKINGS_FILE):
        with open(BOOKINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2)
    
    if not os.path.exists(REQUESTS_FILE):
        with open(REQUESTS_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2)
    
    if not os.path.exists(CHATS_FILE):
        with open(CHATS_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2)

def run_server():
    # Create sample data
    create_sample_data()
    
    # Start server
    port = 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, LocalKiranaHandler)
    
    print(f"LocalKirana server running on http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    print("\nSample Login Credentials:")
    print("Shopkeeper - Phone: +91 9876543210, Password: password123")
    print("Customer - Phone: +91 9876543213, Password: customer123")
    print("\nNew Features Added:")
    print("✅ Store Management System")
    print("✅ Product Management (Add/Edit/Delete)")
    print("✅ Booking Approval System")
    print("✅ Profile Management")
    print("✅ Chat System")
    print("✅ Request Management")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()