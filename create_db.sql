-- create_db.sql
-- Create and initialise the 'health' database and tables

CREATE DATABASE IF NOT EXISTS health;
USE health;

-- Drop tables if they already exist (for re-installing)
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  hashed_password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_date DATE NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  duration_minutes INT NOT NULL,
  intensity VARCHAR(20),
  distance_km DECIMAL(5,2),
  calories INT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activities_users
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);
