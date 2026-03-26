import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { URL } from 'node:url';
import { testConnection } from './db.js';
import { bootstrapDatabase } from './dbBootstrap.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://safezone-campus.vercel.app', 'https://your-vercel-domain.vercel.app'] 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      const host = process.env.DB_HOST || 'localhost';
      const port = process.env.DB_PORT || '3306';
      const dbName = process.env.DB_NAME || 'safezone_campus';
      const usingUrl = (() => {
        if (!process.env.DATABASE_URL) return false;
        try {
          const parsed = new URL(process.env.DATABASE_URL);
          return Boolean(parsed.hostname);
        } catch {
          return false;
        }
      })();
      console.error(
        usingUrl
          ? 'Failed to connect to database. Check DATABASE_URL.'
          : `Failed to connect to database. Check DB_HOST/DB_PORT/DB_NAME (${host}:${port}/${dbName}).`
      );
      console.log('Attempting to start server anyway...');
    } else {
      await bootstrapDatabase();
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API endpoints:`);
      console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   - Reports: http://localhost:${PORT}/api/reports`);
      console.log(`   - Admin: http://localhost:${PORT}/api/admin`);
      console.log(`   - Notifications: http://localhost:${PORT}/api/notifications`);
      console.log(`   - Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
