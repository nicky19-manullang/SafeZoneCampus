import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pool from './db.js';

const splitSqlStatements = (sql) => {
  const statements = [];
  let current = '';

  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  const pushCurrent = () => {
    const trimmed = current.trim();
    if (trimmed) statements.push(trimmed);
    current = '';
  };

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = i + 1 < sql.length ? sql[i + 1] : '';
    const prev = i > 0 ? sql[i - 1] : '';

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (!inSingle && !inDouble && !inBacktick) {
      if (ch === '-' && next === '-' && (i === 0 || /\s/.test(prev))) {
        inLineComment = true;
        i++;
        continue;
      }

      if (ch === '/' && next === '*') {
        inBlockComment = true;
        i++;
        continue;
      }
    }

    if (ch === "'" && !inDouble && !inBacktick) {
      if (!inSingle) {
        inSingle = true;
      } else if (prev !== '\\') {
        inSingle = false;
      }
      current += ch;
      continue;
    }

    if (ch === '"' && !inSingle && !inBacktick) {
      if (!inDouble) {
        inDouble = true;
      } else if (prev !== '\\') {
        inDouble = false;
      }
      current += ch;
      continue;
    }

    if (ch === '`' && !inSingle && !inDouble) {
      inBacktick = !inBacktick;
      current += ch;
      continue;
    }

    if (ch === ';' && !inSingle && !inDouble && !inBacktick) {
      pushCurrent();
      continue;
    }

    current += ch;
  }

  pushCurrent();
  return statements;
};

export const runMigrations = async () => {
  const migrationsDir = fileURLToPath(new URL('./migrations/', import.meta.url));

  await fs.mkdir(migrationsDir, { recursive: true });

  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await connection.query('SELECT filename FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.filename));

    const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.sql'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));

    for (const filename of files) {
      if (applied.has(filename)) continue;

      const filePath = path.join(migrationsDir, filename);
      const sql = await fs.readFile(filePath, 'utf8');
      const statements = splitSqlStatements(sql);

      console.log(`📦 Applying migration: ${filename}`);

      for (const stmt of statements) {
        await connection.query(stmt);
      }

      await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [filename]);
      console.log(`✅ Applied: ${filename}`);
    }

    return { appliedCount: files.filter((f) => !applied.has(f)).length, totalFiles: files.length };
  } finally {
    connection.release();
  }
};

