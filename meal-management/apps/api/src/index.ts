import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import registrationRoutes from './routes/registrations.js';
import mealRoutes from './routes/meals.js';
import checkinRoutes from './routes/checkin.js';
import reportRoutes from './routes/reports.js';
import configRoutes from './routes/config.js';
import priceRoutes, { ensureLegacyPriceMigrated } from './routes/prices.js';
import reviewRoutes from './routes/reviews.js';
import uploadRoutes from './routes/upload.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:", "http:"],
        },
    },
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static uploads
app.use('/static/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/config', configRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// Error handler
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join-meal', (mealEventId: string) => {
        socket.join(`meal-${mealEventId}`);
        console.log(`📍 Socket ${socket.id} joined meal-${mealEventId}`);
    });

    socket.on('leave-meal', (mealEventId: string) => {
        socket.leave(`meal-${mealEventId}`);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 4000;

ensureLegacyPriceMigrated();

httpServer.listen(PORT, () => {
    console.log('');
    console.log('🍽️  Meal Management API Server');
    console.log('================================');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
});

export { io };
