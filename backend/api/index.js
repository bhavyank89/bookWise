import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectToMongoose from './db/db.js';

dotenv.config();

// Import routes
import homeRoutes from './routes/Home.js';
import authRoutes from './routes/Auth.js';
import bookRoutes from './routes/Book.js';
import userRoutes from './routes/User.js';

const app = express();
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
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Handle favicons
app.get('/favicon.ico', (_, res) => res.status(204).end());
app.get('/favicon.png', (_, res) => res.status(204).end());

// Routes
// app.use('/', homeRoutes);
app.use('/', (req, res) => {
    res.status(200).send("Hello bookwise");
});
app.use('/auth', authRoutes);
app.use('/book', bookRoutes);
app.use('/user', userRoutes);

// Fallback
app.use((req, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

// Fallback
app.use((req, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

// ✅ Vercel-compatible export
import serverless from 'serverless-http';
export const handler = serverless(app); // ✅
