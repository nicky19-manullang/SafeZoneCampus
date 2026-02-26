import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = '';
    let params = [];

    // Filter for notifications within last 24 hours only
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    if (req.user.role === 'admin') {
      // Admin gets all report-related notifications (last 24 hours only)
      query = `
        SELECT n.*, r.case_type, r.location 
        FROM notifications n 
        LEFT JOIN reports r ON n.report_id = r.id
        WHERE n.created_at >= ?
        ORDER BY n.created_at DESC 
        LIMIT 20
      `;
      params = [twentyFourHoursAgo];
    } else {
      // Students get their own notifications (last 24 hours only)
      query = `
        SELECT n.*, r.case_type, r.location 
        FROM notifications n 
        LEFT JOIN reports r ON n.report_id = r.id
        WHERE n.user_id = ? AND n.created_at >= ?
        ORDER BY n.created_at DESC 
        LIMIT 20
      `;
      params = [req.user.id, twentyFourHoursAgo];
    }

    const [notifications] = await pool.query(query, params);

    res.json({ data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    let query = '';
    let params = [];

    // Filter for notifications within last 24 hours only
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    if (req.user.role === 'admin') {
      query = `SELECT COUNT(*) as count FROM notifications WHERE is_read = 0 AND created_at >= ?`;
      params = [twentyFourHoursAgo];
    } else {
      query = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0 AND created_at >= ?`;
      params = [req.user.id, twentyFourHoursAgo];
    }

    const [[result]] = await pool.query(query, params);

    res.json({ count: result.count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [id]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      await pool.query('UPDATE notifications SET is_read = 1');
    } else {
      await pool.query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
        [req.user.id]
      );
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to create notification
export const createNotification = async (userId, reportId, type, message, role) => {
  try {
    if (role === 'admin') {
      // Notify all admins
      const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      for (const admin of admins) {
        await pool.query(
          'INSERT INTO notifications (user_id, report_id, type, message) VALUES (?, ?, ?, ?)',
          [admin.id, reportId, type, message]
        );
      }
    } else {
      // Notify specific student
      await pool.query(
        'INSERT INTO notifications (user_id, report_id, type, message) VALUES (?, ?, ?, ?)',
        [userId, reportId, type, message]
      );
    }
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

export default router;
