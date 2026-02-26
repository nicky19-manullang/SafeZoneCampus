-- SafeZone Campus Database Setup
-- Run this script in MySQL to create the database

-- Create database
CREATE DATABASE IF NOT EXISTS safezone_campus;
USE safezone_campus;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('student', 'admin') NOT NULL,
  faculty VARCHAR(50),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nim (nim),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  case_type ENUM('fisik', 'verbal', 'siber', 'sosial', 'lain') NOT NULL,
  incident_date DATE,
  location VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  description TEXT NOT NULL,
  evidence VARCHAR(500),
  status ENUM('baru', 'diproses', 'selesai') DEFAULT 'baru',
  faculty VARCHAR(50),
  anonymous TINYINT(1) DEFAULT 1,
  student_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_case_type (case_type),
  INDEX idx_faculty (faculty),
  INDEX idx_incident_date (incident_date)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  report_id INT,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_report_id (report_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- Insert default admin (password: admin123 - will be hashed by the server)
-- Note: The password will be hashed automatically when the server first runs
-- For now, insert the admin with a placeholder that will be updated
INSERT INTO users (nim, password, name, role, faculty, status) 
VALUES ('admin001', '$2a$10$placeholder', 'Dr. HJ. Dewi Sartika, M.Si', 'admin', 'fk', 'approved')
ON DUPLICATE KEY UPDATE name = name;

-- Note: Run the server once to hash the admin password properly
-- Or you can use the API endpoint to create admin users

-- Reset AUTO_INCREMENT for reports table to start from 1
-- Option 1: If you want to keep existing data but start new reports from ID 1:
ALTER TABLE reports AUTO_INCREMENT = 1;

-- Option 2: If you want to delete all existing reports and start fresh from ID 1:
-- TRUNCATE TABLE reports;
