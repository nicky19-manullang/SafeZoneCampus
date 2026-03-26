CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('student','admin') NOT NULL,
  faculty VARCHAR(50) NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_nim (nim),
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(20) PRIMARY KEY,
  student_id INT NULL,
  case_type ENUM('fisik','verbal','siber','sosial','lain') NOT NULL,
  incident_date DATE NULL,
  location VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NULL,
  lng DECIMAL(11, 8) NULL,
  description TEXT NOT NULL,
  evidence VARCHAR(500) NULL,
  status ENUM('baru','diproses','selesai') DEFAULT 'baru',
  faculty VARCHAR(50) NULL,
  anonymous TINYINT(1) DEFAULT 1,
  student_name VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reports_student_id (student_id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_case_type (case_type),
  INDEX idx_reports_faculty (faculty),
  INDEX idx_reports_incident_date (incident_date),
  CONSTRAINT fk_reports_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  report_id VARCHAR(20) NULL,
  type ENUM('new_report','status_update','approval') NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_is_read (is_read),
  INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

