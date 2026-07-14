CREATE DATABASE IF NOT EXISTS sapadu;
USE sapadu;

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    age INT,
    email VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('admin', 'user') DEFAULT 'user',
    emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_username VARCHAR(50),
    donor_name VARCHAR(100),
    donor_age INT,
    food_name VARCHAR(255),
    food_type VARCHAR(50),
    quantity INT,
    mfg_date DATE,
    expiry_date DATE,
    location_label VARCHAR(255),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    freshness_score DECIMAL(3, 1),
    expiry_days INT,
    pay_type VARCHAR(50),
    pay_info VARCHAR(255),
    status ENUM('available', 'requested', 'delivered') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_username) REFERENCES Users(username)
);

CREATE TABLE IF NOT EXISTS Requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    req_username VARCHAR(50),
    req_name VARCHAR(100),
    req_age INT,
    donation_id INT,
    food_name VARCHAR(255),
    quantity INT,
    urgency VARCHAR(50),
    location_label VARCHAR(255),
    priority_score DECIMAL(5, 2),
    distance_km DECIMAL(6, 2),
    status ENUM('pending', 'assigned', 'done') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (req_username) REFERENCES Users(username),
    FOREIGN KEY (donation_id) REFERENCES Donations(id)
);

CREATE TABLE IF NOT EXISTS Volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vol_username VARCHAR(50),
    vol_name VARCHAR(100),
    vol_age INT,
    vehicle_type VARCHAR(50),
    pickup_location VARCHAR(255),
    shift VARCHAR(50),
    time_slot VARCHAR(50),
    status ENUM('active', 'busy') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vol_username) REFERENCES Users(username)
);

CREATE TABLE IF NOT EXISTS Ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_username VARCHAR(50),
    category VARCHAR(50),
    score INT,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
