import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// Generate unique report ID
const generateReportId = async () => {
  const [result] = await pool.query('SELECT COUNT(*) as count FROM reports');
  const num = (result[0].count || 0) + 1;
  return `RPT-${num.toString().padStart(4, '0')}`;
};

// Get all reports (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    
    const { status, caseType, faculty, dateFrom, dateTo } = req.query;
    
    let query = `
      SELECT r.*, u.name as student_name, u.nim as student_nim 
      FROM reports r 
      LEFT JOIN users u ON r.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    if (caseType) {
      query += ' AND r.case_type = ?';
      params.push(caseType);
    }
    if (faculty) {
      query += ' AND r.faculty = ?';
      params.push(faculty);
    }
    if (dateFrom) {
      query += ' AND r.created_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND r.created_at <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY r.created_at DESC';

    const [reports] = await pool.query(query, params);
    res.json({ data: reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's own reports
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Akses ditolak - hanya untuk mahasiswa' });
    }
    
    // Convert to number for consistent comparison
    const studentId = Number(req.user.id);
    console.log('Student requesting reports. ID:', studentId);
    
    // First, check what's in DB
    const [allReports] = await pool.query('SELECT id, student_id, case_type FROM reports LIMIT 5');
    console.log('Sample reports in DB:', allReports);
    
    // Use CAST for safer comparison
    const [reports] = await pool.query(
      'SELECT * FROM reports WHERE CAST(student_id AS SIGNED) = ? ORDER BY created_at DESC',
      [studentId]
    );
    
    console.log('Found reports for student', studentId, ':', reports.length);

    // Map to camelCase for frontend consistency
    const normalizedReports = reports.map(report => ({
      id: report.id,
      caseType: report.case_type,
      incidentDate: report.incident_date,
      location: report.location,
      description: report.description,
      evidence: report.evidence,
      status: report.status,
      faculty: report.faculty,
      anonymous: report.anonymous,
      studentName: report.student_name,
      createdAt: report.created_at,
      updatedAt: report.updated_at
    }));

    res.json({ data: normalizedReports });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Create new report
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Hanya mahasiswa yang dapat membuat laporan' });
    }
    
    const { caseType, incidentDate, location, lat, lng, description, evidence, anonymous, faculty } = req.body;

    console.log('Creating report - User ID:', req.user.id, 'Role:', req.user.role);

    if (!caseType || !location || !description) {
      return res.status(400).json({ 
        message: 'Jenis kasus, lokasi, dan deskripsi wajib diisi' 
      });
    }

    const reportId = await generateReportId();
    const studentId = Number(req.user.id);
    const studentName = anonymous ? null : req.user.name;

    console.log('Inserting report with student_id:', studentId);

    await pool.query(
      `INSERT INTO reports (id, student_id, case_type, incident_date, location, lat, lng, description, evidence, status, faculty, anonymous, student_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'baru', ?, ?, ?)`,
      [reportId, studentId, caseType, incidentDate || null, location, lat || null, lng || null, description, evidence || null, faculty, anonymous ? 1 : 0, studentName]
    );

    // Verify
    const [verify] = await pool.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    console.log('Report created:', verify);

    // Notify admin about new report
    await createNotification(
      null,
      reportId,
      'new_report',
      `Laporan baru dari ${studentName || 'Mahasiswa'} - ${caseType} di ${location}`,
      'admin'
    );

    res.status(201).json({
      id: reportId,
      case_type: caseType,
      incident_date: incidentDate,
      location,
      description,
      status: 'baru',
      created_at: new Date()
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get report by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [reports] = await pool.query(
      `SELECT r.*, u.name as student_name, u.nim as student_nim 
       FROM reports r 
       LEFT JOIN users u ON r.student_id = u.id 
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    if (req.user.role === 'student') {
      const report = reports[0];
      if (Number(report.student_id) !== Number(req.user.id) && report.student_id !== null) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }

    res.json(reports[0]);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report status (admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['baru', 'diproses', 'selesai'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const [oldReport] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (oldReport.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status laporan diperbarui' });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
