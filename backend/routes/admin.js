import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Get all pending students
router.get('/pending-students', async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT id, nim, name, faculty, status, created_at 
       FROM users 
       WHERE role = 'student' AND status = 'pending'
       ORDER BY created_at DESC`
    );

    res.json({ data: students });
  } catch (error) {
    console.error('Get pending students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT id, nim, name, faculty, status, created_at 
      FROM users 
      WHERE role = 'student'
    `;
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [students] = await pool.query(query, params);

    res.json({ data: students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve student
router.post('/approve-student/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get student info first
    const [students] = await pool.query('SELECT * FROM users WHERE id = ? AND role = ?', [id, 'student']);
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    }

    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ? AND role = ?',
      ['approved', id, 'student']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    }

    // No notification sent - approval notification removed per requirements

    res.json({ message: 'Mahasiswa berhasil disetujui' });
  } catch (error) {
    console.error('Approve student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject student
router.post('/reject-student/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ? AND role = ?',
      ['rejected', id, 'student']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    }

    // No notification sent - rejection notification removed per requirements

    res.json({ message: 'Mahasiswa berhasil ditolak' });
  } catch (error) {
    console.error('Reject student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report status
router.put('/reports/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['baru', 'diproses', 'selesai'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    // Get old report for notification
    const [oldReport] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (oldReport.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    const [result] = await pool.query(
      'UPDATE reports SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    // Create notification for student
    const studentId = oldReport[0].student_id;
    if (studentId) {
      const statusMessages = {
        'baru': 'Laporan Anda telah diterima dan akan segera diproses',
        'diproses': 'Laporan Anda sedang dalam proses penanganan oleh tim admin',
        'selesai': 'Laporan Anda telah selesai ditangani. Terima kasih atas kesabaran Anda.'
      };
      
      await createNotification(
        studentId,
        id,
        'status_update',
        statusMessages[status],
        'student'
      );
    }

    res.json({ message: 'Status laporan diperbarui' });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [[totalReports]] = await pool.query('SELECT COUNT(*) as count FROM reports');
    const [[ baru ]] = await pool.query("SELECT COUNT(*) as count FROM reports WHERE status = 'baru'");
    const [[ proses ]] = await pool.query("SELECT COUNT(*) as count FROM reports WHERE status = 'diproses'");
    const [[ selesai ]] = await pool.query("SELECT COUNT(*) as count FROM reports WHERE status = 'selesai'");
    const [[ totalStudents ]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'approved'");
    const [[ pendingStudents ]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'pending'");

    const resolvedRate = totalReports.count > 0 
      ? Math.round((selesai.count / totalReports.count) * 100) 
      : 0;

    res.json({
      data: {
        totalReports: totalReports.count,
        baru: baru.count,
        proses: proses.count,
        selesai: selesai.count,
        resolvedRate,
        totalStudents: totalStudents.count,
        pendingStudents: pendingStudents.count
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly reports
router.get('/stats/monthly', async (req, res) => {
  try {
    const [reports] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as count 
      FROM reports 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%m')
      ORDER BY created_at
    `);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(month => {
      const found = reports.find(r => r.month === month);
      return found ? found.count : 0;
    });

    res.json({ data: { labels: months, values: data } });
  } catch (error) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports by case type
router.get('/stats/by-type', async (req, res) => {
  try {
    const [reports] = await pool.query(`
      SELECT case_type, COUNT(*) as count 
      FROM reports 
      GROUP BY case_type
    `);

    const data = {
      fisik: 0,
      verbal: 0,
      siber: 0,
      sosial: 0,
      lain: 0
    };

    reports.forEach(r => {
      data[r.case_type] = r.count;
    });

    res.json({ data });
  } catch (error) {
    console.error('Get by type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get location data from reports
router.get('/locations', async (req, res) => {
  try {
    const [reports] = await pool.query(
      'SELECT location, lat, lng, COUNT(*) as count FROM reports WHERE lat IS NOT NULL AND lng IS NOT NULL GROUP BY location, lat, lng'
    );

    const data = reports.map(r => ({
      name: r.location,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
      count: r.count
    }));

    res.json({ data });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get safety index
router.get('/stats/safety-index', async (req, res) => {
  try {
    // Get report statistics
    const [[total]] = await pool.query('SELECT COUNT(*) as count FROM reports');
    const [[selesai]] = await pool.query("SELECT COUNT(*) as count FROM reports WHERE status = 'selesai'");
    const [[diproses]] = await pool.query("SELECT COUNT(*) as count FROM reports WHERE status = 'diproses'");
    const [[baru]] = await pool.query("SELECT COUNT(*) as count FROM reports WHERE status = 'baru'");

    // Calculate indicators based on real data
    const resolvedRate = total.count > 0 ? Math.round((selesai.count / total.count) * 100) : 0;
    const pendingRate = total.count > 0 ? Math.round(((baru.count + diproses.count) / total.count) * 100) : 100;
    
    // Calculate safety score (0-100)
    const baseScore = 70;
    const resolvedBonus = Math.round((resolvedRate / 100) * 20);
    const score = Math.min(100, baseScore + resolvedBonus);

    // Determine trend based on resolved rate
    const trend = resolvedRate >= 50 ? 'up' : 'down';
    const change = resolvedRate >= 50 ? `+${resolvedRate - 50}%` : `${resolvedRate - 50}%`;

    // Get reports by case type
    const [byType] = await pool.query(`
      SELECT case_type, COUNT(*) as count 
      FROM reports 
      GROUP BY case_type
    `);

    const caseTypeData = { fisik: 0, verbal: 0, siber: 0, sosial: 0, lain: 0 };
    byType.forEach(r => { caseTypeData[r.case_type] = r.count; });

    // Calculate average response time
    const avgResponseTime = resolvedRate >= 70 ? '< 24 jam' : resolvedRate >= 50 ? '24-48 jam' : '> 48 jam';

    res.json({
      data: {
        score,
        label: 'Campus Safety Index',
        trend,
        change,
        totalReports: total.count,
        resolvedRate,
        avgResponseTime,
        pendingRate,
        indicators: {
          responsiveness: resolvedRate >= 70 ? 85 : resolvedRate >= 50 ? 65 : 45,
          resolutionRate: resolvedRate,
          studentSafety: Math.min(100, 70 + (resolvedRate / 2)),
          campusSecurity: score,
          onlineSafety: caseTypeData.siber > 0 ? Math.max(50, 80 - (caseTypeData.siber * 5)) : 80,
          physicalSafety: caseTypeData.fisik > 0 ? Math.max(60, 90 - (caseTypeData.fisik * 3)) : 90
        }
      }
    });
  } catch (error) {
    console.error('Get safety index error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create admin user
router.post('/create-admin', async (req, res) => {
  try {
    const { nim, password, name, faculty } = req.body;

    if (!nim || !password || !name) {
      return res.status(400).json({ message: 'NIM, nama, dan password wajib diisi' });
    }

    // Check if NIM already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE nim = ?', [nim]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'NIM sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (nim, password, name, role, faculty, status) VALUES (?, ?, ?, ?, ?, ?)',
      [nim, hashedPassword, name, 'admin', faculty || 'fit', 'approved']
    );

    res.status(201).json({ message: 'Admin berhasil dibuat' });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
