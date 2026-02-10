-- AutoLot Database Schema

CREATE DATABASE IF NOT EXISTS autolot;
USE autolot;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('guest', 'registered', 'verified', 'dealer', 'moderator', 'admin') DEFAULT 'registered',
    reputation_score INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    trim VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    mileage INT NOT NULL,
    `condition` ENUM('Excellent', 'Very Good', 'Good', 'Fair', 'Poor') DEFAULT 'Good',
    body_type VARCHAR(50),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    drivetrain VARCHAR(50),
    exterior_color VARCHAR(50),
    interior_color VARCHAR(50),
    vin VARCHAR(17) UNIQUE,
    image TEXT, -- Stores comma-separated list of image URLs/filenames
    description TEXT,
    features TEXT, -- Comma-separated or JSON list of features
    title_status ENUM('Clean', 'Salvage', 'Rebuilt') DEFAULT 'Clean',
    accidents ENUM('None', 'Minor', 'Moderate', 'Major') DEFAULT 'None',
    contact_method VARCHAR(100),
    pricing_strategy VARCHAR(50),
    show_phone BOOLEAN DEFAULT FALSE,
    seller_id INT,
    `status` ENUM('active', 'pending', 'sold', 'archived') DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table (Leads)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT,
    vehicle_id INT,
    user_id INT, -- Sender
    message TEXT NOT NULL,
    `status` ENUM('new', 'contacted', 'negotiating', 'sold', 'lost') DEFAULT 'new',
    dealer_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Car Stories (Community Blog)
CREATE TABLE IF NOT EXISTS car_stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    `status` ENUM('draft', 'published') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- Comments System
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    story_id INT DEFAULT NULL,
    vehicle_id INT DEFAULT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (story_id) REFERENCES car_stories(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Watchlist System
CREATE TABLE IF NOT EXISTS watchlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, vehicle_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
