import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import authRoutes    from './routes/auth';
import usersRoutes   from './routes/users';
import petsRoutes    from './routes/pets';
import vendorsRoutes from './routes/vendors';
import bookingsRoutes from './routes/bookings';
import eventsRoutes  from './routes/events';
import postsRoutes   from './routes/posts';
import uploadRoutes  from './routes/upload';
import adminRoutes   from './routes/admin';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Core Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Rate limiting on auth routes ─────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many requests — please slow down' },
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/pets',     petsRoutes);
app.use('/api/vendors',  vendorsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/events',   eventsRoutes);
app.use('/api/posts',    postsRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/admin',    adminRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🐾 The Pet Point API running on http://localhost:${PORT}`);
});

export default app;
