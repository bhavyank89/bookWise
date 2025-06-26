import express from 'express';
import cors from 'cors';
import connectToMongoose from './db/db.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import homeRoutes from './routes/Home.js';
import authRoutes from './routes/Auth.js';
import bookRoutes from './routes/Book.js';
import userRoutes from './routes/User.js';

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// Connect to MongoDB
connectToMongoose();

// CORS Setup
const ADMIN_URL = process.env.ADMIN_URL;
const MAIN_URL = process.env.MAIN_URL || 'https://bookwise-main.vercel.app';

// ✅ Fix: Build a dynamic origin validator
const allowedOrigins = [ADMIN_URL, MAIN_URL].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`❌ CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/book', bookRoutes);
app.use('/user', userRoutes);

// Fallback Route
app.use((req, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
