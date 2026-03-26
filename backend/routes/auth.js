import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const NODE_ENV = process.env.NODE_ENV || 'development';
const BOOTSTRAP_TOKEN = process.env.BOOTSTRAP_TOKEN;

const requireBootstrapToken = (req, res) => {
  if (NODE_ENV !== 'production') return true;
  if (!BOOTSTRAP_TOKEN) return res.status(404).json({ message: 'Route not found' });
  const provided = req.get('x-bootstrap-token');
  if (!provided || provided !== BOOTSTRAP_TOKEN) {
    res.status(401).json({ message: 'Unauthorized' });
    return false;
  }
  return true;
};

// Seed database (for deployment)
router.post('/seed', async (req, res) => {
  try {
    if (!requireBootstrapToken(req, res)) return;
    const bcrypt = await import('bcryptjs');
    
    // Create admin user
    const adminPasswordPlain = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    if (NODE_ENV === 'production' && adminPasswordPlain === 'admin123') {
      return res.status(400).json({ message: 'DEFAULT_ADMIN_PASSWORD wajib diset di production' });
    }
    const adminPassword = await bcrypt.default.hash(adminPasswordPlain, 10);
    await pool.query(`
      INSERT IGNORE INTO users (nim, password, name, role, faculty, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['admin001', adminPassword, 'Dr. HJ. Dewi Sartika, M.Si', 'admin', 'fit', 'approved']);
    
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed database', error: error.message });
  }
});

// Reset admin password (temporary endpoint for deployment)
router.post('/reset-admin', async (req, res) => {
  try {
    if (!requireBootstrapToken(req, res)) return;
    const bcrypt = await import('bcryptjs');
    const adminPasswordPlain = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    if (NODE_ENV === 'production' && adminPasswordPlain === 'admin123') {
      return res.status(400).json({ message: 'DEFAULT_ADMIN_PASSWORD wajib diset di production' });
    }
    const adminPassword = await bcrypt.default.hash(adminPasswordPlain, 10);
    
    await pool.query(`
      UPDATE users 
      SET password = ? 
      WHERE nim = 'admin001' AND role = 'admin'
    `, [adminPassword]);
    
    res.json({ message: 'Admin password reset' });
  } catch (error) {
    console.error('Reset admin error:', error);
    res.status(500).json({ message: 'Failed to reset admin password', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { nim, password } = req.body;

    if (!nim || !password) {
      return res.status(400).json({ message: 'NIM dan password wajib diisi' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE nim = ?',
      [nim]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'NIM atau password salah' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'NIM atau password salah' });
    }

    // Check if student account is approved
    if (user.role === 'student' && user.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Akun Anda belum disetujui oleh admin. Silakan hubungi admin.' 
      });
    }

    // Generate JWT token - ensure id is a number
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
    const token = jwt.sign(
      {
        id: Number(user.id),
        nim: user.nim,
        name: user.name,
        role: user.role,
        faculty: user.faculty,
        status: user.status
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      accessToken: token,
      user: {
        id: Number(user.id),
        nim: user.nim,
        name: user.name,
        role: user.role,
        faculty: user.faculty,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server (Database/Koneksi).', error: error.message });
  }
});

// Register (for students only)
router.post('/register', async (req, res) => {
  try {
    const { nim, password, name, faculty } = req.body;

    if (!nim || !password || !name) {
      return res.status(400).json({ 
        message: 'NIM, nama, dan password wajib diisi' 
      });
    }

    // Check if NIM already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE nim = ?',
      [nim]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'NIM sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new student (status = pending by default)
    const [result] = await pool.query(
      `INSERT INTO users (nim, password, name, role, faculty, status) 
       VALUES (?, ?, ?, 'student', ?, 'pending')`,
      [nim, hashedPassword, name, faculty || null]
    );

    res.status(201).json({
      message: 'Registrasi berhasil! Akun Anda akan diverifikasi oleh admin.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nim, name, role, faculty, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Password lama dan baru wajib diisi' 
      });
    }

    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password lama salah' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, faculty } = req.body;

    if (!name) {
      return res.status(400).json({ 
        message: 'Nama wajib diisi' 
      });
    }

    const [result] = await pool.query(
      'UPDATE users SET name = ?, faculty = ? WHERE id = ?',
      [name, faculty || null, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Get updated user data
    const [users] = await pool.query(
      'SELECT id, nim, name, role, faculty, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ 
      message: 'Profil berhasil diperbarui',
      user: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
