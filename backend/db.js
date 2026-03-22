// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config();

// // For Vercel/PlanetScale, use connection string if available
// const connectionString = process.env.DATABASE_URL;

// const pool = connectionString ? mysql.createPool(connectionString) : mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   port: parseInt(process.env.DB_PORT) || 3307,
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'safezone_campus',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
// });

// // Test database connection
// export const testConnection = async () => {
//   try {
//     const connection = await pool.getConnection();
//     console.log('✅ Database connected successfully');
//     connection.release();
//     return true;
//   } catch (error) {
//     console.error('❌ Database connection failed:', error.message);
//     return false;
//   }
// };

// // Initialize database tables
// export const initDatabase = async () => {
//   const connection = await pool.getConnection();
  
//   try {
//     // Create users table
//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         nim VARCHAR(20) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         name VARCHAR(100) NOT NULL,
//         role ENUM('student', 'admin') NOT NULL,
//         faculty VARCHAR(50),
//         status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         INDEX idx_nim (nim),
//         INDEX idx_role (role),
//         INDEX idx_status (status)
//       )
//     `);
//     console.log('✅ Users table created');

//     // Create reports table
//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS reports (
//         id VARCHAR(20) PRIMARY KEY,
//         student_id INT,
//         case_type ENUM('fisik', 'verbal', 'siber', 'sosial', 'lain') NOT NULL,
//         incident_date DATE,
//         location VARCHAR(255) NOT NULL,
//         description TEXT NOT NULL,
//         evidence VARCHAR(500),
//         status ENUM('baru', 'diproses', 'selesai') DEFAULT 'baru',
//         faculty VARCHAR(50),
//         anonymous TINYINT(1) DEFAULT 1,
//         student_name VARCHAR(100),
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL,
//         INDEX idx_student_id (student_id),
//         INDEX idx_status (status),
//         INDEX idx_case_type (case_type),
//         INDEX idx_faculty (faculty),
//         INDEX idx_incident_date (incident_date)
//       )
//     `);
//     console.log('✅ Reports table created');

//     // Create notifications table - without foreign key constraints to avoid errors
//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS notifications (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT,
//         report_id VARCHAR(20),
//         type ENUM('new_report', 'status_update', 'approval') NOT NULL,
//         message TEXT NOT NULL,
//         is_read TINYINT(1) DEFAULT 0,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         INDEX idx_user_id (user_id),
//         INDEX idx_is_read (is_read)
//       )
//     `);
//     console.log('✅ Notifications table created');

//     // Create admin user (default)
//     const bcrypt = await import('bcryptjs');
//     const adminPassword = await bcrypt.default.hash('admin123', 10);
    
//     await connection.query(`
//       INSERT IGNORE INTO users (nim, password, name, role, faculty, status)
//       VALUES (?, ?, ?, ?, ?, ?)
//     `, ['admin001', adminPassword, 'Dr. HJ. Dewi Sartika, M.Si', 'admin', 'fit', 'approved']);
    
//     console.log('✅ Default admin user created');

//     // NOTE: earlier versions of the application automatically wiped the
//     // reports table every time the server started. This was convenient for
//     // development/demo purposes, but it meant that data would never persist
//     // across restarts – exactly the behaviour you observed.  In production we
//     // want to keep the reports around, so the deletion has been removed.
//     //
//     // If you *do* need to reset the table (e.g. when running tests), you can
//     // call `clearReportsData()` manually or enable the `RESET_REPORTS`
//     // environment variable.
//     if (process.env.RESET_REPORTS === 'true') {
//       await connection.query('DELETE FROM reports');
//       console.log('✅ Reports data cleared (RESET_REPORTS=true)');
//     }

//     connection.release();
//     console.log('✅ Database initialization complete');
//     return true;
//   } catch (error) {
//     connection.release();
//     console.error('❌ Database initialization failed:', error.message);
//     throw error;
//   }
// };

// // Clear all reports data
// export const clearReportsData = async () => {
//   const connection = await pool.getConnection();
//   try {
//     await connection.query('DELETE FROM reports');
//     console.log('✅ All reports data cleared');
//     return true;
//   } catch (error) {
//     console.error('❌ Failed to clear reports:', error.message);
//     throw error;
//   } finally {
//     connection.release();
//   }
// };

// export default pool;
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Railway biasanya menggunakan DATABASE_URL
const connectionString = process.env.DATABASE_URL;

// create connection pool
const pool = mysql.createPool(connectionString, {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// test koneksi database
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database Railway connected");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

// buat tabel otomatis jika belum ada
export const initDatabase = async () => {
  const connection = await pool.getConnection();

  try {

    // USERS TABLE
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nim VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('student','admin') NOT NULL,
        faculty VARCHAR(50),
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ users table ready");

    // REPORTS TABLE
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(20) PRIMARY KEY,
        student_id INT,
        case_type ENUM('fisik','verbal','siber','sosial','lain') NOT NULL,
        incident_date DATE,
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        evidence VARCHAR(500),
        status ENUM('baru','diproses','selesai') DEFAULT 'baru',
        faculty VARCHAR(50),
        anonymous TINYINT(1) DEFAULT 1,
        student_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ reports table ready");

    // NOTIFICATIONS TABLE
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        report_id VARCHAR(20),
        type ENUM('new_report','status_update','approval') NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ notifications table ready");

    // CREATE DEFAULT ADMIN
    const bcrypt = await import("bcryptjs");
    const adminPassword = await bcrypt.default.hash("admin123", 10);

    await connection.query(`
      INSERT IGNORE INTO users (nim,password,name,role,faculty,status)
      VALUES (?,?,?,?,?,?)
    `, [
      "admin001",
      adminPassword,
      "Admin SafeZone",
      "admin",
      "fit",
      "approved"
    ]);

    console.log("✅ default admin ready");

  } catch (error) {

    console.error("❌ Database init error:", error.message);

  } finally {

    connection.release();

  }
};

export default pool;