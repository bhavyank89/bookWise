import express from 'express';
import cors from 'cors';
import connectToMongoose from './db/db.js';

// Route Imports
import homeRoutes from './routes/Home.js';
import authRoutes from './routes/Auth.js';
import getUserRoute from './routes/GetUser.js';
import bookRoutes from './routes/Book.js';
import borrowBookRoutes from './routes/BorrowBook.js';
import verifyUserRoutes from './routes/VerifyUser.js';
import getBooksRoute from './routes/GetBooks.js';
import fetchUsersRoute from './routes/FetchUsers.js';
import getBorrowHistory from './routes/BorrowHistory.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectToMongoose();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // ✅ Only allow your frontend origin
    credentials: true // ✅ Allow cookies and headers to be sent
}));
app.use(express.json());

// Routes
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/fetchuser', getUserRoute);
app.use('/book', bookRoutes);
app.use('/borrowbook', borrowBookRoutes);
app.use('/verifyuser', verifyUserRoutes);
app.use('/user', getBooksRoute);
app.use('/fetchall', fetchUsersRoute);
app.use('/user/borrowHistory', getBorrowHistory);

// Optional: Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ message: '❌ Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
