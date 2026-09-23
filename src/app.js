import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import {
  notFoundHandler,
  errorHandler,
} from './middlewares/errorMiddleware.js';

const app = express();

// Security & parser
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiter global
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mounting routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/items', itemRoutes);

// Error handling (paling bawah)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;