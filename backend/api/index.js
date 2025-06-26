import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import connectToMongoose from '../db/db.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import homeRoutes from '../routes/Home.js';
import authRoutes from '../routes/Auth.js';
import bookRoutes from '../routes/Book.js';
import userRoutes from '../routes/User.js';

const app = express();

// Connect to MongoDB (run only once in serverless environment)
connectToMongoose();

const allowedOrigins = [
    process.env.MAIN_URL || 'https://bookwise-main.vercel.app',
    process.env.ADMIN_URL || 'https://bookwise-admin.vercel.app',
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn("Blocked by CORS:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

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

// Export handler for Vercel
export default serverless(app);
