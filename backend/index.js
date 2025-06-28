import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectToMongoose from './db/db.js';

dotenv.config();

import homeRoutes from './routes/Home.js';
import authRoutes from './routes/Auth.js';
import bookRoutes from './routes/Book.js';
import userRoutes from './routes/User.js';

const app = express();
const PORT = process.env.PORT || 4000;

connectToMongoose();

const allowedOrigins = [
    process.env.MAIN_URL || 'https://bookwise-main.vercel.app',
    process.env.ADMIN_URL || 'https://bookwise-admin.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (_, res) => res.send('📚 Bookwise API is running'));
app.use('/auth', authRoutes);
app.use('/book', bookRoutes);
app.use('/user', userRoutes);

app.use((_, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
