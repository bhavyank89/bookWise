import express from 'express';
import User from '../models/User.js';
import Book from '../models/Book.js';
import FetchUser from '../middlewares/FetchUser.js';

const router = express.Router();

router.use(express.json());

// fetchAll users
router.get('/fetchall', async (req, res) => {
    let success = false;
    try {
        const users = await User.find().sort({ createdAt: -1 });
        if (!users) {
            return res.status(404).json({ success, error: "No users found" });
        }
        success = true;
        res.status(201).json({ success, users });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, error: "Internal Server Error" });
    }
});

// fetch single user using id in params
router.get('/fetch/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// fetch logged In user
router.get('/', FetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// verify user
router.put('/verify', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (user.isverified) {
            return res.status(400).json({ success: false, error: "User is already verified" });
        }

        user.isverified = true;
        const updatedUser = await user.save();

        return res.status(200).json({
            success: true,
            message: "User verified successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isverified: updatedUser.isverified
            }
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// deverify user
router.put('/deverify', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        user.isverified = false;
        const updatedUser = await user.save();

        return res.status(200).json({
            success: true,
            message: "User verification removed successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isverified: updatedUser.isverified
            }
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// ----------------- BORROWED HISTORY ------------------
router.get("/borrowedHistory", FetchUser, async (req, res) => {
    try {
        const userId = req.user.id;

        // ✅ Fetch books where this user appears in borrowHistory
        const books = await Book.find({ "borrowHistory.user": userId })
            .select("title author genre borrowHistory thumbnailCloudinary")
            .sort({ createdAt: -1 })
            .lean();

        const history = [];

        for (const book of books) {
            const userBorrows = book.borrowHistory.filter(
                (entry) => entry.user.toString() === userId
            );

            for (const entry of userBorrows) {
                history.push({
                    bookId: book._id,
                    title: book.title,
                    author: book.author,
                    genre: book.genre,
                    thumbnail: book.thumbnailCloudinary || null,

                    // Borrow details
                    requestedAt: entry.requestedAt || null,
                    borrowedAt: entry.borrowedAt || null,
                    dueDate: entry.dueDate || null,
                    returnedAt: entry.returnedAt || null,
                    lateFine: entry.lateFine || 0,
                    currentlyBorrowed: !entry.returnedAt, // still borrowed if not returned
                });
            }
        }

        return res.status(200).json({ success: true, history });
    } catch (err) {
        console.error("Error fetching borrow history:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// ------------------ SAVE EBOOK ONLY ------------------
router.post("/savebook/:id", FetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const bookId = req.params.id;

        if (!bookId) {
            return res.status(400).json({ success: false, error: "Book ID is required" });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ success: false, error: "Book not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // ✅ Check if book already saved by user
        const alreadySavedByUser = user.savedBooks.some(
            (saved) => saved.book.toString() === bookId
        );
        if (alreadySavedByUser) {
            return res.status(400).json({ success: false, error: "Book already saved by user" });
        }

        // ✅ Check if user already exists in book's savedBy
        const alreadyInBookSavedBy = book.savedBy.some(
            (savedUserId) => savedUserId.toString() === userId
        );
        if (alreadyInBookSavedBy) {
            return res.status(400).json({ success: false, error: "User already saved this book" });
        }

        // ✅ Add book to user's savedBooks
        user.savedBooks.push({ book: bookId });

        // ✅ Add user to book's savedBy
        book.savedBy.push(userId);

        // Save both
        await user.save();
        await book.save();

        return res.status(200).json({
            success: true,
            message: "Book saved successfully",
            savedBooks: user.savedBooks,
        });

    } catch (error) {
        console.error("Save book error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// ------------------ UNSAVE EBOOK ONLY ------------------
router.delete("/unsavebook/:bookId", FetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId } = req.params;

        if (!bookId) {
            return res.status(400).json({ success: false, error: "Book ID is required" });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ success: false, error: "Book not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // ✅ Remove from user's savedBooks
        user.savedBooks = user.savedBooks.filter(
            (entry) => entry.book.toString() !== bookId
        );

        // ✅ Remove user from book's savedBy
        book.savedBy = book.savedBy.filter(
            (id) => id.toString() !== userId
        );

        await user.save();
        await book.save();

        return res.status(200).json({
            success: true,
            message: "Book unsaved successfully",
            savedBooks: user.savedBooks,
        });

    } catch (error) {
        console.error("Unsave book error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// ------------------ SAVED HISTORY --------------------
router.get("/savedbooks", FetchUser, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate({
            path: "savedBooks.book",
            model: "Book",
            select: "title author genre thumbnailCloudinary bookType createdAt", // select only necessary fields
        });

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Filter out any null books (e.g. deleted ones)
        const savedBooks = user.savedBooks
            .filter((entry) => entry.book)
            .map((entry) => ({
                _id: entry.book._id,
                title: entry.book.title,
                author: entry.book.author,
                genre: entry.book.genre,
                bookType: entry.book.bookType,
                thumbnailCloudinary: entry.book.thumbnailCloudinary || null,
                savedAt: entry.savedOn || null,
            }));

        return res.status(200).json({ success: true, savedBooks });
    } catch (error) {
        console.error("Error fetching saved books:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// ------------------ DELETE USER ----------------------
router.delete('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Step 1: Find the user
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Step 2: Loop over borrowed books (active), update book availability and borrowers list
        for (const borrow of user.borrowedBooks) {
            const book = await Book.findById(borrow.book);
            if (book) {
                // Increase available count
                book.available += 1;

                // Remove user from active borrowers
                book.borrowers = book.borrowers.filter(b => b.user.toString() !== userId);
                await book.save();
            }
        }

        // Step 3: Clean savedBy list from all books
        await Book.updateMany(
            { savedBy: user._id },
            { $pull: { savedBy: user._id } }
        );

        // Step 4: Clean borrowHistory and borrowers in books
        const allBooks = await Book.find({
            $or: [
                { 'borrowHistory.user': user._id },
                { 'borrowers.user': user._id },
            ]
        });

        for (const book of allBooks) {
            book.borrowers = book.borrowers.filter(b => b.user.toString() !== userId);
            book.borrowHistory = book.borrowHistory.filter(h => h.user.toString() !== userId);
            await book.save();
        }

        // Step 5: Finally, delete the user
        await user.deleteOne();

        res.status(200).json({ success: true, message: 'User deleted and data cleaned up successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting user' });
    }
});

export default router;
