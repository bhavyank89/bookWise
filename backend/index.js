import express from 'express';
import cors from 'cors';
import connectToMongoose from './db/db.js';
import cookieParser from 'cookie-parser';

// Route Imports
import homeRoutes from './routes/Home.js';
import authRoutes from './routes/Auth.js';
import bookRoutes from './routes/Book.js';
import userRoutes from './routes/User.js';

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// Connect to MongoDB
connectToMongoose();

const ADMIN_URL = process.env.ADMIN_URL;
const MAIN_URL = process.env.MAIN_URL;

// Middleware
const allowedOrigins = [
    `${ADMIN_URL}`,
    `${MAIN_URL}`,
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/book', bookRoutes);
app.use('/user', userRoutes);

// Optional: Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
