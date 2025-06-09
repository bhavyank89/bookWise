import express from 'express';
import fetchUser from '../middlewares/FetchUser.js';
import Book from '../models/Book.js';

const router = express.Router();
router.use(express.json());

router.put('/request/:id', fetchUser, async (req, res) => {
    const user_Id = req.user.id;
    const book_Id = req.params.id;

    try {
        const book = await Book.findById(book_Id);
        if (!book) {
            return res.status(404).json({ success: false, error: "Book not found" });
        }

        // ✅ Check if already borrowed
        const alreadyBorrowed = book.borrowers.find(
            (entry) => entry.user.toString() === user_Id && entry.borrowed === true
        );
        if (alreadyBorrowed) {
            return res.status(400).json({ success: false, error: "User has already borrowed this book" });
        }

        // ✅ Check if already requested
        const alreadyRequested = book.borrowers.find(
            (entry) => entry.user.toString() === user_Id
        );
        if (alreadyRequested) {
            return res.status(400).json({ success: false, error: "User has already requested this book" });
        }

        // ✅ Check availability
        if (book.available <= 0) {
            return res.status(400).json({ success: false, error: "Book not available right now" });
        }

        // ✅ Add request
        book.borrowers.push({
            user: user_Id,
            borrowed: false,
            requestedAt: Date.now(),
        });

        await book.save();

        res.status(200).json({ success: true, message: "Book request sent!" });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});


export default router;
