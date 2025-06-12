import express from "express";
import Book from "../models/Book.js";
import fetchUser from "../middlewares/FetchUser.js";

const router = express.Router();

router.get("/", fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all books that the user has borrowed (returned or not)
        const books = await Book.find({ "borrowers.user": userId })
            .select("title author genre borrowers").sort({ createdAt: -1 }) // only required fields
            .lean();

        // Filter borrower history for this user
        const borrowHistory = [];

        for (const book of books) {
            const userBorrowEntry = book.borrowers.find(
                (entry) => entry.user.toString() === userId
            );

            if (userBorrowEntry) {
                borrowHistory.push({
                    bookId: book._id,
                    title: book.title,
                    author: book.author,
                    genre: book.genre,
                    borrowedAt: userBorrowEntry.borrowedAt,
                    dueDate: userBorrowEntry.dueDate,
                    returnedAt: userBorrowEntry.returnedAt || null,
                    lateFine: userBorrowEntry.lateFine || 0,
                    currentlyBorrowed: userBorrowEntry.borrowed === true,
                });
            }
        }

        return res.json({ success: true, history: borrowHistory });
    } catch (err) {
        console.error("Error fetching borrow history:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

export default router;
