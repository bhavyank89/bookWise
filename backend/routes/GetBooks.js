import express from 'express';
import User from '../models/User.js';
import FetchUser from '../middlewares/FetchUser.js';

const router = express.Router();

// Route: GET /fetchall - Get all books borrowed by the logged-in user
router.get('/books', FetchUser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user and populate the books they have borrowed
        const userData = await User.findById(userId).populate('books');

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, books: userData.books });

    } catch (error) {
        console.error("Fetch Borrowed Books Error:", error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

export default router;
