import bcrypt from 'bcryptjs';

import pool from './db.js';
import { runMigrations } from './migrationRunner.js';

export const ensureDefaultAdmin = async () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const nim = process.env.DEFAULT_ADMIN_NIM || 'admin001';
  const passwordFromEnv = process.env.DEFAULT_ADMIN_PASSWORD;
  const password = passwordFromEnv || 'admin123';
  const name = process.env.DEFAULT_ADMIN_NAME || 'Admin SafeZone';
  const faculty = process.env.DEFAULT_ADMIN_FACULTY || 'fit';

  if (nodeEnv === 'production' && (!passwordFromEnv || passwordFromEnv === 'admin123')) {
    throw new Error('DEFAULT_ADMIN_PASSWORD wajib diset (dan kuat) di production');
  }

  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT IGNORE INTO users (nim, password, name, role, faculty, status)
     VALUES (?, ?, ?, 'admin', ?, 'approved')`,
    [nim, hashed, name, faculty]
  );
};

export const bootstrapDatabase = async () => {
  await runMigrations();
  await ensureDefaultAdmin();
};
