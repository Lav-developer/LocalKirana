-- LocalKirana Database Schema
-- Run this SQL script to create the database structure

CREATE DATABASE IF NOT EXISTS localkirana_db;
USE localkirana_db;

-- Customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    location TEXT,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stores table
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    category ENUM('grocery', 'medical', 'stationery', 'electronics', 'general') NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(50) NOT NULL,
    description TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    store_phone VARCHAR(20) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Requests table
CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_location TEXT,
    item_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    description TEXT,
    target_store VARCHAR(255),
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Chats table
CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id VARCHAR(255) UNIQUE NOT NULL,
    participant1_id INT NOT NULL,
    participant1_type ENUM('customer', 'shopkeeper') NOT NULL,
    participant2_id INT NOT NULL,
    participant2_type ENUM('customer', 'shopkeeper') NOT NULL,
    last_message TEXT,
    last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id VARCHAR(255) NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('customer', 'shopkeeper') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO customers (name, phone, email, location, password_hash) VALUES
('John Doe', '+91 9876543213', 'john@example.com', 'Sector 15, Delhi', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJunKx9bO');

INSERT INTO stores (shop_name, owner_name, phone, email, address, pincode, category, password_hash) VALUES
('Sharma General Store', 'Raj Sharma', '+91 9876543210', 'raj@sharma.com', '123 Main Street, Sector 15', '110001', 'grocery', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJunKx9bO'),
('City Medical Store', 'Dr. Priya Patel', '+91 9876543211', 'priya@citymedical.com', '456 Health Plaza, Medical District', '110002', 'medical', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJunKx9bO'),
('Tech Electronics Hub', 'Amit Kumar', '+91 9876543212', 'amit@techhub.com', '789 Electronics Market, Tech City', '110003', 'electronics', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJunKx9bO');

INSERT INTO products (store_id, name, price, available) VALUES
(1, 'Rice (1kg)', '₹80', TRUE),
(1, 'Dal (1kg)', '₹120', TRUE),
(1, 'Oil (1L)', '₹150', TRUE),
(1, 'Sugar (1kg)', '₹45', FALSE),
(2, 'Paracetamol', '₹25', TRUE),
(2, 'Cough Syrup', '₹85', TRUE),
(2, 'Bandages', '₹30', TRUE),
(2, 'Thermometer', '₹200', TRUE),
(3, 'Mobile Charger', '₹299', TRUE),
(3, 'Earphones', '₹599', TRUE),
(3, 'Power Bank', '₹1299', FALSE),
(3, 'Phone Case', '₹199', TRUE);