#!/usr/bin/env python3
import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse
from datetime import datetime
import bcrypt
from dotenv import load_dotenv
from database.connection import db

# Load environment variables
load_dotenv()

class LocalKiranaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Connect to database
        if not db.connection or not db.connection.is_connected():
            db.connect()
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
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password, hashed):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def register_customer(self, data):
        # Check if customer already exists
        existing_phone = db.execute_query(
            "SELECT id FROM customers WHERE phone = %s", 
            (data['phone'],)
        )
        if existing_phone:
            self.send_json_response({'success': False, 'message': 'Phone number already registered'})
            return
        
        existing_email = db.execute_query(
            "SELECT id FROM customers WHERE email = %s", 
            (data['email'],)
        )
        if existing_email:
            self.send_json_response({'success': False, 'message': 'Email already registered'})
            return
        
        # Hash password and insert customer
        password_hash = self.hash_password(data['password'])
        
        customer_id = db.execute_insert(
            """INSERT INTO customers (name, phone, email, location, password_hash) 
               VALUES (%s, %s, %s, %s, %s)""",
            (data['name'], data['phone'], data['email'], data['location'], password_hash)
        )
        
        if customer_id:
            self.send_json_response({'success': True, 'message': 'Customer registered successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to register customer'}, 500)
    
    def login_customer(self, data):
        customer = db.execute_query(
            "SELECT * FROM customers WHERE phone = %s", 
            (data.get('phone'),)
        )
        
        if customer and len(customer) > 0:
            customer_data = customer[0]
            if self.verify_password(data.get('password', ''), customer_data['password_hash']):
                # Remove password from response
                del customer_data['password_hash']
                self.send_json_response({'success': True, 'user': customer_data})
                return
        
        self.send_json_response({'success': False, 'message': 'Invalid phone number or password'})
    
    def login_shopkeeper(self, data):
        store = db.execute_query(
            "SELECT * FROM stores WHERE phone = %s", 
            (data.get('phone'),)
        )
        
        if store and len(store) > 0:
            store_data = store[0]
            if self.verify_password(data.get('password', ''), store_data['password_hash']):
                # Remove password from response
                del store_data['password_hash']
                # Get products for this store
                products = db.execute_query(
                    "SELECT * FROM products WHERE store_id = %s", 
                    (store_data['id'],)
                )
                store_data['products'] = products or []
                self.send_json_response({'success': True, 'user': store_data})
                return
        
        self.send_json_response({'success': False, 'message': 'Invalid phone number or password'})
    
    def get_stores(self):
        stores = db.execute_query("SELECT * FROM stores WHERE status = 'active'")
        if stores:
            # Get products for each store
            for store in stores:
                products = db.execute_query(
                    "SELECT * FROM products WHERE store_id = %s", 
                    (store['id'],)
                )
                store['products'] = products or []
                # Remove password hash
                if 'password_hash' in store:
                    del store['password_hash']
        
        self.send_json_response({'success': True, 'stores': stores or []})
    
    def get_customers(self):
        customers = db.execute_query("SELECT id, name, phone, email, location, status, created_at FROM customers")
        self.send_json_response({'success': True, 'customers': customers or []})
    
    def register_shop(self, data):
        # Check if shop already exists
        existing_phone = db.execute_query(
            "SELECT id FROM stores WHERE phone = %s", 
            (data['phone'],)
        )
        if existing_phone:
            self.send_json_response({'success': False, 'message': 'Phone number already registered'})
            return
        
        existing_email = db.execute_query(
            "SELECT id FROM stores WHERE email = %s", 
            (data['email'],)
        )
        if existing_email:
            self.send_json_response({'success': False, 'message': 'Email already registered'})
            return
        
        # Hash password and insert store
        password_hash = self.hash_password(data['password'])
        
        store_id = db.execute_insert(
            """INSERT INTO stores (shop_name, owner_name, phone, email, address, pincode, category, password_hash) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (data['shopName'], data['ownerName'], data['phone'], data['email'], 
             data['address'], data['pincode'], data['category'], password_hash)
        )
        
        if store_id:
            # Add default products
            default_products = self.get_default_products(data['category'])
            for product in default_products:
                db.execute_insert(
                    "INSERT INTO products (store_id, name, price, available) VALUES (%s, %s, %s, %s)",
                    (store_id, product['name'], product['price'], product['available'])
                )
            
            self.send_json_response({'success': True, 'message': 'Shop registered successfully', 'shop_id': store_id})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to save shop data'}, 500)
    
    def book_item(self, data):
        # Get customer and store IDs
        customer = db.execute_query("SELECT id FROM customers WHERE phone = %s", (data['customerPhone'],))
        store = db.execute_query("SELECT id FROM stores WHERE phone = %s", (data['storePhone'],))
        
        if not customer or not store:
            self.send_json_response({'success': False, 'message': 'Invalid booking data'}, 400)
            return
        
        # Get product ID
        product = db.execute_query("SELECT id FROM products WHERE name = %s AND store_id = %s", 
                                 (data['itemName'], store[0]['id']))
        
        product_id = product[0]['id'] if product else None
        
        booking_id = db.execute_insert(
            """INSERT INTO bookings (customer_id, store_id, product_id, customer_name, customer_phone, 
                                   store_name, store_phone, item_name, status) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (customer[0]['id'], store[0]['id'], product_id, data['customerName'], 
             data['customerPhone'], data['storeName'], data['storePhone'], data['itemName'], 'pending')
        )
        
        if booking_id:
            self.send_json_response({'success': True, 'message': 'Item booked successfully', 'booking_id': booking_id})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to save booking'}, 500)
    
    def request_item(self, data):
        # Get customer ID
        customer = db.execute_query("SELECT id FROM customers WHERE phone = %s", (data['customerPhone'],))
        
        if not customer:
            self.send_json_response({'success': False, 'message': 'Customer not found'}, 400)
            return
        
        request_id = db.execute_insert(
            """INSERT INTO requests (customer_id, customer_name, customer_phone, customer_location, 
                                   item_name, quantity, description, target_store, status) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (customer[0]['id'], data['customerName'], data['customerPhone'], data['customerLocation'],
             data['itemName'], data['quantity'], data.get('description', ''), 
             data.get('targetStore', 'All Stores'), 'pending')
        )
        
        if request_id:
            self.send_json_response({'success': True, 'message': 'Item request sent successfully', 'request_id': request_id})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to save request'}, 500)
    
    def update_store(self, data):
        store_id = data.get('id')
        if not store_id:
            self.send_json_response({'success': False, 'message': 'Store ID required'}, 400)
            return
        
        # Remove password from update data
        if 'password_hash' in data:
            del data['password_hash']
        
        # Build update query dynamically
        update_fields = []
        values = []
        for key, value in data.items():
            if key != 'id':
                update_fields.append(f"{key} = %s")
                values.append(value)
        
        if not update_fields:
            self.send_json_response({'success': False, 'message': 'No fields to update'}, 400)
            return
        
        values.append(store_id)
        query = f"UPDATE stores SET {', '.join(update_fields)} WHERE id = %s"
        
        result = db.execute_query(query, values)
        if result is not None:
            self.send_json_response({'success': True, 'message': 'Store updated successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to update store'}, 500)
    
    def update_customer(self, data):
        customer_id = data.get('id')
        if not customer_id:
            self.send_json_response({'success': False, 'message': 'Customer ID required'}, 400)
            return
        
        # Remove password from update data
        if 'password_hash' in data:
            del data['password_hash']
        
        # Build update query dynamically
        update_fields = []
        values = []
        for key, value in data.items():
            if key != 'id':
                update_fields.append(f"{key} = %s")
                values.append(value)
        
        if not update_fields:
            self.send_json_response({'success': False, 'message': 'No fields to update'}, 400)
            return
        
        values.append(customer_id)
        query = f"UPDATE customers SET {', '.join(update_fields)} WHERE id = %s"
        
        result = db.execute_query(query, values)
        if result is not None:
            self.send_json_response({'success': True, 'message': 'Customer updated successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to update customer'}, 500)
    
    def add_product(self, data):
        store_id = data.get('storeId')
        product = data.get('product')
        
        if not store_id or not product:
            self.send_json_response({'success': False, 'message': 'Store ID and product data required'}, 400)
            return
        
        product_id = db.execute_insert(
            "INSERT INTO products (store_id, name, price, description, available) VALUES (%s, %s, %s, %s, %s)",
            (store_id, product['name'], product['price'], product.get('description', ''), product['available'])
        )
        
        if product_id:
            self.send_json_response({'success': True, 'message': 'Product added successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to add product'}, 500)
    
    def update_product(self, data):
        store_id = data.get('storeId')
        product_index = data.get('productIndex')
        product = data.get('product')
        
        if store_id is None or product_index is None or not product:
            self.send_json_response({'success': False, 'message': 'Store ID, product index, and product data required'}, 400)
            return
        
        # Get the product ID based on store and index
        products = db.execute_query("SELECT id FROM products WHERE store_id = %s ORDER BY id", (store_id,))
        
        if not products or product_index >= len(products):
            self.send_json_response({'success': False, 'message': 'Product not found'}, 404)
            return
        
        product_id = products[product_index]['id']
        
        result = db.execute_query(
            "UPDATE products SET name = %s, price = %s, description = %s, available = %s WHERE id = %s",
            (product['name'], product['price'], product.get('description', ''), product['available'], product_id)
        )
        
        if result is not None:
            self.send_json_response({'success': True, 'message': 'Product updated successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to update product'}, 500)
    
    def delete_product(self, data):
        store_id = data.get('storeId')
        product_index = data.get('productIndex')
        
        if store_id is None or product_index is None:
            self.send_json_response({'success': False, 'message': 'Store ID and product index required'}, 400)
            return
        
        # Get the product ID based on store and index
        products = db.execute_query("SELECT id FROM products WHERE store_id = %s ORDER BY id", (store_id,))
        
        if not products or product_index >= len(products):
            self.send_json_response({'success': False, 'message': 'Product not found'}, 404)
            return
        
        product_id = products[product_index]['id']
        
        result = db.execute_query("DELETE FROM products WHERE id = %s", (product_id,))
        
        if result is not None:
            self.send_json_response({'success': True, 'message': 'Product deleted successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to delete product'}, 500)
    
    def update_booking_status(self, data):
        booking_id = data.get('bookingId')
        status = data.get('status')
        
        if not booking_id or not status:
            self.send_json_response({'success': False, 'message': 'Booking ID and status required'}, 400)
            return
        
        result = db.execute_query(
            "UPDATE bookings SET status = %s WHERE id = %s",
            (status, booking_id)
        )
        
        if result is not None:
            self.send_json_response({'success': True, 'message': 'Booking status updated successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to update booking status'}, 500)
    
    def get_bookings(self):
        bookings = db.execute_query("SELECT * FROM bookings ORDER BY created_at DESC")
        self.send_json_response({'success': True, 'bookings': bookings or []})
    
    def get_requests(self):
        requests = db.execute_query("SELECT * FROM requests ORDER BY created_at DESC")
        self.send_json_response({'success': True, 'requests': requests or []})
    
    def get_chats(self):
        chats = db.execute_query("SELECT * FROM chats ORDER BY last_message_time DESC")
        if chats:
            for chat in chats:
                messages = db.execute_query(
                    "SELECT * FROM messages WHERE chat_id = %s ORDER BY created_at ASC",
                    (chat['chat_id'],)
                )
                chat['messages'] = messages or []
        
        self.send_json_response({'success': True, 'chats': chats or []})
    
    def save_chat(self, data):
        chat_id = data.get('id')
        message = data.get('message')
        sender_id = data.get('senderId')
        sender_type = data.get('senderType')
        
        if not all([chat_id, message, sender_id, sender_type]):
            self.send_json_response({'success': False, 'message': 'Missing required chat data'}, 400)
            return
        
        # Check if chat exists, if not create it
        existing_chat = db.execute_query("SELECT id FROM chats WHERE chat_id = %s", (chat_id,))
        
        if not existing_chat:
            # Parse chat_id to get participants
            parts = chat_id.split('_')
            if len(parts) == 4:
                participant1_type, participant1_id, participant2_type, participant2_id = parts
                
                db.execute_insert(
                    """INSERT INTO chats (chat_id, participant1_id, participant1_type, participant2_id, participant2_type) 
                       VALUES (%s, %s, %s, %s, %s)""",
                    (chat_id, int(participant1_id), participant1_type, int(participant2_id), participant2_type)
                )
        
        # Insert message
        message_id = db.execute_insert(
            "INSERT INTO messages (chat_id, sender_id, sender_type, message) VALUES (%s, %s, %s, %s)",
            (chat_id, sender_id, sender_type, message)
        )
        
        # Update chat last message
        db.execute_query(
            "UPDATE chats SET last_message = %s, last_message_time = NOW() WHERE chat_id = %s",
            (message, chat_id)
        )
        
        if message_id:
            self.send_json_response({'success': True, 'message': 'Chat saved successfully'})
        else:
            self.send_json_response({'success': False, 'message': 'Failed to save chat'}, 500)
    
    def get_default_products(self, category):
        default_products = {
            'grocery': [
                {'name': 'Rice (1kg)', 'price': '₹80', 'available': True},
                {'name': 'Dal (1kg)', 'price': '₹120', 'available': True},
                {'name': 'Oil (1L)', 'price': '₹150', 'available': True},
                {'name': 'Sugar (1kg)', 'price': '₹45', 'available': True}
            ],
            'medical': [
                {'name': 'Paracetamol', 'price': '₹25', 'available': True},
                {'name': 'Cough Syrup', 'price': '₹85', 'available': True},
                {'name': 'Bandages', 'price': '₹30', 'available': True},
                {'name': 'Antiseptic', 'price': '₹45', 'available': True}
            ],
            'stationery': [
                {'name': 'Notebook', 'price': '₹25', 'available': True},
                {'name': 'Pen Set', 'price': '₹50', 'available': True},
                {'name': 'Pencil Box', 'price': '₹75', 'available': True},
                {'name': 'Eraser', 'price': '₹5', 'available': True}
            ],
            'electronics': [
                {'name': 'Mobile Charger', 'price': '₹299', 'available': True},
                {'name': 'Earphones', 'price': '₹599', 'available': True},
                {'name': 'Power Bank', 'price': '₹1299', 'available': True},
                {'name': 'Phone Case', 'price': '₹199', 'available': True}
            ],
            'general': [
                {'name': 'Soap', 'price': '₹30', 'available': True},
                {'name': 'Shampoo', 'price': '₹120', 'available': True},
                {'name': 'Toothpaste', 'price': '₹45', 'available': True},
                {'name': 'Detergent', 'price': '₹80', 'available': True}
            ]
        }
        
        return default_products.get(category, default_products['general'])
    
    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        response = json.dumps(data, ensure_ascii=False, default=str)
        self.wfile.write(response.encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

def run_server():
    # Connect to database
    if not db.connect():
        print("Failed to connect to database. Please check your configuration.")
        return
    
    # Start server
    port = int(os.getenv('PORT', 8000))
    server_address = ('', port)
    httpd = HTTPServer(server_address, LocalKiranaHandler)
    
    print(f"LocalKirana MySQL server running on http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    print("\nDatabase: MySQL")
    print("Environment: Production Ready")
    print("\nSample Login Credentials:")
    print("Shopkeeper - Phone: +91 9876543210, Password: password123")
    print("Customer - Phone: +91 9876543213, Password: customer123")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        db.disconnect()
        httpd.server_close()

if __name__ == '__main__':
    run_server()