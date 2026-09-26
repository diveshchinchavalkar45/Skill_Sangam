import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDb, query } from './db/index.js';
import { seed } from './db/seed.js';

import authRoutes from './routes/authRoutes.js';
import { profileRouter, userRouter } from './routes/profileRoutes.js';
import { skillsRouter, domainsRouter, rolesRouter, availabilityRouter } from './routes/metaRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import { apiLimiter } from './middleware/rateLimit.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Core Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for easy demo & deployment
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan('dev'));

// General API rate limiter
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await query('SELECT NOW() as now');
    return res.json({
      status: 'ok',
      service: 'SkillSangam API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: dbTest.rows[0]?.now
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      service: 'SkillSangam API',
      database: 'disconnected',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRouter);
app.use('/api/users', userRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/domains', domainsRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/projects', projectRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assignments', assignmentRoutes);

// Static client files for production
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log('Serving client static build from:', clientDistPath);
  app.use(express.static(clientDistPath));
}

// 404 for unhandled API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `API endpoint ${req.originalUrl} not found`
    }
  });
});

// SPA fallback for non-API GET routes
app.use((req, res, next) => {
  if (req.method === 'GET' && fs.existsSync(path.join(clientDistPath, 'index.html'))) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

// Database Initialization & Ready State
let dbInitialized = false;
let dbInitPromise = null;

export async function ensureDbReady() {
  if (dbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await initDb();
      const usersCount = await query('SELECT COUNT(*) FROM users');
      if (Number(usersCount.rows[0].count) === 0) {
        console.log('Database is empty. Automatically running seed script...');
        await seed();
      }
      dbInitialized = true;
    })();
  }
  return dbInitPromise;
}

// Middleware to ensure DB is initialized before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDbReady();
    next();
  } catch (err) {
    console.error('Database initialization error:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'DB_INIT_ERROR',
        message: 'Failed to initialize database: ' + err.message
      }
    });
  }
});

// Bootstrap Server for non-serverless environments
if (!process.env.VERCEL) {
  ensureDbReady().then(() => {
    app.listen(PORT, () => {
      console.log(`========================================================================`);
      console.log(` SkillSangam Server running at http://localhost:${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`========================================================================`);
    });
  }).catch((err) => {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  });
}

export default app;

