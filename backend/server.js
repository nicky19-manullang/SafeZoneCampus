import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, initDatabase } from './db.js';
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
      console.error('Failed to connect to database. Make sure MySQL is running on port 3307');
      console.log('Attempting to start server anyway...');
    } else {
      // Initialize database tables
      await initDatabase();
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
