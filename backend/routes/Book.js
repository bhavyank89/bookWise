import express from "express";
import fs from "fs";
import fetchUser from '../middlewares/FetchUser.js';

import {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  updateCloudinary,
  handleMulterError
} from "../middlewares/uploadFile.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

const router = express.Router();

// ------------------ CREATE BOOK ------------------
router.post("/createbook",
  upload.fields([
    { name: "uploadPDF", maxCount: 1 },
    { name: "uploadThumbnail", maxCount: 1 },
    { name: "uploadVideo", maxCount: 1 },
  ]),
  handleMulterError,
  async (req, res) => {
    try {
      const {
        title,
        author,
        genre,
        summary,
        count: countRaw,
        bookType,
      } = req.body;

      if (!title || !author || !summary || !bookType) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: title, author, summary, and bookType are required.",
        });
      }

      if (!["physical", "ebook", "both"].includes(bookType)) {
        return res.status(400).json({
          success: false,
          error: "Invalid bookType. Must be one of: physical, ebook, both.",
        });
      }

      let count = parseInt(countRaw, 10);
      if (isNaN(count)) count = 0;

      if ((bookType === "physical" || bookType === "both") && count < 0) {
        return res.status(400).json({
          success: false,
          error: "Count must be a non-negative integer for physical books.",
        });
      }

      const pdfFile = req.files?.uploadPDF?.[0];
      const thumbnailFile = req.files?.uploadThumbnail?.[0];
      const videoFile = req.files?.uploadVideo?.[0];

      // Validate required files
      if ((bookType === "ebook" || bookType === "both") && !pdfFile) {
        return res.status(400).json({
          success: false,
          error: "PDF file is required for ebooks.",
        });
      }

      if (!thumbnailFile) {
        return res.status(400).json({
          success: false,
          error: "Thumbnail image is required.",
        });
      }

      let pdfResult = null,
        thumbnailResult = null,
        videoResult = null;

      try {
        const uploadPromises = [
          pdfFile ? uploadToCloudinary(pdfFile.path, "books/pdf") : Promise.resolve(null),
          uploadToCloudinary(thumbnailFile.path, "books/thumbnails"),
          videoFile ? uploadToCloudinary(videoFile.path, "books/videos") : Promise.resolve(null),
        ];

        [pdfResult, thumbnailResult, videoResult] = await Promise.all(uploadPromises);
      } catch (uploadError) {
        [pdfFile, thumbnailFile, videoFile].forEach((file) => {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
        return res.status(500).json({
          success: false,
          error: "File upload failed",
          details: uploadError.message || uploadError,
        });
      }

      // Cleanup local files
      [pdfFile, thumbnailFile, videoFile].forEach((file) => {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });

      // Create book data
      const bookData = {
        title,
        author,
        genre,
        summary,
        bookType,
        borrowers: [],
        savedBy: [],
        pdfCloudinary: pdfResult || null,
        thumbnailCloudinary: thumbnailResult || null,
        videoCloudinary: videoResult || null,
        count: 0,
        available: 0,
      };

      if (bookType === "physical" || bookType === "both") {
        bookData.count = count;
        bookData.available = count;
      }

      const newBook = new Book(bookData);
      console.log("new Book : ", newBook);

      await newBook.validate();
      await newBook.save();

      return res.status(201).json({
        success: true,
        book: newBook,
      });
    } catch (err) {
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: errors,
        });
      }

      console.error("Create book error:", err);
      return res.status(500).json({
        success: false,
        error: "An error occurred while creating the book",
        details: err.message || err,
      });
    }
  }
);

// ------------------ FETCH ALL BOOKS ------------------
router.get("/fetchall", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching books"
    });
  }
});

// ------------------ FETCH SINGLE BOOK ------------------
router.get("/fetch/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching the book"
    });
  }
});

// ------------------ BORROW REQUEST --------------------
router.put('/request/:id', fetchUser, async (req, res) => {
  const user_Id = req.user.id;
  const book_Id = req.params.id;

  try {
    const book = await Book.findById(book_Id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const user = await User.findById(user_Id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // ✅ Check if already requested/borrowed (in book.borrowers)
    const alreadyRequested = book.borrowers.find(
      (entry) => entry.user.toString() === user_Id && !entry.returnedAt
    );
    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        error: 'User has already requested or borrowed this book',
      });
    }

    // ✅ Check availability for physical books
    if (book.bookType === 'physical' || book.bookType === 'both') {
      if (book.available <= 0) {
        return res.status(400).json({
          success: false,
          error: 'No copies available to borrow right now',
        });
      }
    }

    // ✅ Add to book.borrowers
    const borrowEntry = {
      user: user_Id,
      borrowed: false,
      requestedAt: Date.now(),
    };
    book.borrowers.push(borrowEntry);

    // ✅ Add to user.borrowedBooks
    const userBorrowEntry = {
      book: book_Id,
      borrowed: false,
      requestedAt: Date.now(),
    };
    user.borrowedBooks.push(userBorrowEntry);

    await book.save();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Book request placed successfully',
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// ------------------ BORROW ISSUE --------------------------
router.post('/borrow/:id', async (req, res) => {
  const user_Id = req.body.user_Id;
  const book_Id = req.params.id;

  try {
    const book = await Book.findById(book_Id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const user = await User.findById(user_Id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // ✅ Check if already borrowed and not returned
    const alreadyBorrowed = book.borrowers.find(
      (entry) => entry.user.toString() === user_Id && entry.borrowed === true && !entry.returnedAt
    );
    if (alreadyBorrowed) {
      return res.status(400).json({ success: false, error: 'User has already borrowed this book' });
    }

    // ✅ Check physical availability
    if ((book.bookType === 'physical' || book.bookType === 'both') && book.available <= 0) {
      return res.status(400).json({ success: false, error: 'Book not available right now' });
    }

    const borrowedAt = new Date();
    const dueDate = new Date(borrowedAt.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    // ✅ Update book.borrowers
    const existingBookEntry = book.borrowers.find(
      (entry) => entry.user.toString() === user_Id && entry.borrowed === false
    );

    if (existingBookEntry) {
      existingBookEntry.borrowed = true;
      existingBookEntry.borrowedAt = borrowedAt;
      existingBookEntry.dueDate = dueDate;
    } else {
      book.borrowers.push({
        user: user_Id,
        borrowed: true,
        borrowedAt,
        dueDate,
        requestedAt: borrowedAt,
      });
    }

    // ✅ Update user's borrowedBooks
    const userBorrowEntry = user.borrowedBooks.find(
      (entry) => entry.book.toString() === book_Id
    );

    if (userBorrowEntry) {
      userBorrowEntry.borrowed = true;
      userBorrowEntry.borrowedAt = borrowedAt;
      userBorrowEntry.dueDate = dueDate;
      userBorrowEntry.returnedAt = null;
      userBorrowEntry.lateFine = 0;
    } else {
      user.borrowedBooks.push({
        book: book_Id,
        borrowed: true,
        borrowedAt,
        dueDate,
        requestedAt: borrowedAt,
        returnedAt: null,
        lateFine: 0,
      });
    }

    // ✅ Update book availability
    if (book.bookType === 'physical' || book.bookType === 'both') {
      book.available -= 1;
    }

    await book.save();
    await user.save();

    res.status(200).json({ success: true, message: 'Book Borrowed Successfully!' });
  } catch (error) {
    console.error('Borrow route error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// ------------------ FETCH BORROWERS ------------------
router.get("/borrowers/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    const enrichedBorrowers = [];

    for (const entry of book.borrowers) {
      // ✅ Skip returned books (shouldn't be here, but extra safety)
      if (entry.returnedAt) continue;

      const user = await User.findById(entry.user).lean();
      if (!user) continue;

      enrichedBorrowers.push({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userThumbnailCloudinary: user.avatar || null,
        borrowed: entry.borrowed,
        requestedAt: entry.requestedAt || null,
        borrowedAt: entry.borrowedAt || null,
        dueDate: entry.dueDate || null,
        lateFine: entry.lateFine || 0,
      });
    }

    return res.json({ success: true, borrowers: enrichedBorrowers });

  } catch (error) {
    console.error("Error fetching borrowers:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching borrowers"
    });
  }
});

// Fetch all borrow requests (requested and issued)
router.get('/all-requests', async (req, res) => {
  try {
    const books = await Book.find({
      borrowers: { $exists: true, $not: { $size: 0 } }
    }).sort({ createdAt: -1 });

    const allRequests = [];

    for (const book of books) {
      if (!Array.isArray(book.borrowers) || book.borrowers.length === 0) continue;

      for (const entry of book.borrowers) {
        // ✅ Skip returned books (shouldn't be in active borrowers, but double-check)
        if (entry.returnedAt) continue;

        const user = await User.findById(entry.user).lean();
        if (!user) continue;

        allRequests.push({
          bookId: book._id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          bookThumbnailCloudinary: book.thumbnailCloudinary || null,
          bookType: book.bookType,

          userId: user._id,
          uniId: user.uniId,
          userName: user.name || "Unknown User",
          userEmail: user.email || "Unknown Email",
          userThumbnailCloudinary: user.avatar || null,

          borrowed: entry.borrowed,
          requestedAt: entry.requestedAt || null,
          borrowedAt: entry.borrowedAt || null,
          dueDate: entry.dueDate || null,
          lateFine: entry.lateFine || 0,
        });
      }
    }

    return res.status(200).json({ success: true, requests: allRequests });
  } catch (error) {
    console.error("Error fetching all borrow requests:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ------------------ RETURN BOOK ------------------
router.post("/return/:id", async (req, res) => {
  try {
    const userId = req.body.user_Id;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    // ✅ Find borrow entry in book.borrowers
    const borrowerIndex = book.borrowers.findIndex(
      (b) => b.user.toString() === userId && b.borrowed === true && !b.returnedAt
    );

    if (borrowerIndex === -1) {
      return res.status(400).json({ success: false, error: "You haven't borrowed this book" });
    }

    const borrowerEntry = book.borrowers[borrowerIndex];
    const returnedAt = new Date();

    // ✅ Calculate late fine
    let lateFine = 0;
    if (borrowerEntry.dueDate) {
      const lateDays = Math.ceil((returnedAt - new Date(borrowerEntry.dueDate)) / (1000 * 60 * 60 * 24));
      if (lateDays > 0) lateFine = lateDays * 10; // ₹10 per day
    }

    // ✅ Finalize borrowerEntry
    borrowerEntry.returnedAt = returnedAt;
    borrowerEntry.borrowed = false;
    borrowerEntry.lateFine = lateFine;

    // ✅ Add to borrowHistory before removing
    book.borrowHistory.push({
      user: borrowerEntry.user,
      requestedAt: borrowerEntry.requestedAt,
      borrowedAt: borrowerEntry.borrowedAt,
      dueDate: borrowerEntry.dueDate,
      returnedAt,
      lateFine,
    });

    // ✅ Remove from current borrowers list
    book.borrowers.splice(borrowerIndex, 1);

    // ✅ Update physical book availability
    if (book.bookType === 'physical' || book.bookType === 'both') {
      book.available += 1;
    }

    await book.save();

    // ✅ Update User schema
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userBorrowIndex = user.borrowedBooks.findIndex(
      (b) => b.book.toString() === bookId && !b.returnedAt
    );

    if (userBorrowIndex !== -1) {
      const userEntry = user.borrowedBooks[userBorrowIndex];

      // ✅ Add to user.borrowHistory
      user.borrowHistory.push({
        book: bookId,
        requestedAt: userEntry.requestedAt,
        borrowedAt: userEntry.borrowedAt,
        dueDate: userEntry.dueDate,
        returnedAt,
        lateFine,
      });

      // ✅ Remove from current borrowed list
      user.borrowedBooks.splice(userBorrowIndex, 1);
    }

    await user.save();

    res.json({
      success: true,
      message: "Book returned successfully",
      returnedAt,
      lateFine,
    });

  } catch (error) {
    console.error("Return book error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ------------------ BORROW HISTORY OF USER -------------------
router.post("/borrowedHistory", async (req, res) => {
  try {
    const userId = req.body.user_Id;

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    // ✅ Fetch user avatar and basic info
    const user = await User.findById(userId).select("name email avatar");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // ✅ Fetch books where this user has any borrow history
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
          // 🔹 Book info
          bookId: book._id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          bookThumbnail: book.thumbnailCloudinary || null,

          // 🔹 User info
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          userAvatar: user.avatar || null,

          // 🔹 Borrow details
          requestedAt: entry.requestedAt || null,
          borrowedAt: entry.borrowedAt || null,
          dueDate: entry.dueDate || null,
          returnedAt: entry.returnedAt || null,
          lateFine: entry.lateFine || 0,
          currentlyBorrowed: !entry.returnedAt, // true if not yet returned
        });
      }
    }

    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("Error fetching borrow history:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ------------------ COMBINED BORROW HISTORY ------------------
router.get('/all-borrow-history', async (req, res) => {
  try {
    const users = await User.find({})
      .populate({
        path: 'borrowHistory.book',
        select: 'title author bookType thumbnailCloudinary' // only necessary fields
      })
      .select('name email avatar uniId borrowHistory'); // include avatar & uniId

    const combinedHistory = users.flatMap(user =>
      user.borrowHistory.map(history => ({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userUniId: user.uniId || null,
        userAvatar: user.avatar || null,

        bookId: history.book?._id || null,
        bookTitle: history.book?.title || 'Deleted Book',
        bookAuthor: history.book?.author || 'Unknown',
        bookType: history.book?.bookType || 'N/A',
        bookThumbnailCloudinary: history.book?.thumbnailCloudinary || null,

        requestedAt: history.requestedAt,
        borrowedAt: history.borrowedAt,
        dueDate: history.dueDate,
        returnedAt: history.returnedAt,
        lateFine: history.lateFine,
      }))
    );

    // Sort by returnedAt descending
    combinedHistory.sort((a, b) => new Date(b.returnedAt) - new Date(a.returnedAt));

    res.status(200).json({ success: true, data: combinedHistory });
  } catch (error) {
    console.error('Error fetching combined borrow history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ------------------ UPDATE BOOK ------------------
// Added fetchUser middleware here for authentication protection
router.put("/update/:id", upload.fields([
  { name: "uploadPDF", maxCount: 1 },
  { name: "uploadThumbnail", maxCount: 1 },
  { name: "uploadVideo", maxCount: 1 },
]),
  handleMulterError,
  async (req, res) => {
    try {
      const { id } = req.params;
      const book = await Book.findById(id);

      if (!book) {
        return res.status(404).json({ success: false, error: "Book not found" });
      }

      const {
        title,
        author,
        genre,
        count,
        available,
        summary,
      } = req.body;

      book.title = title || book.title;
      book.author = author || book.author;
      book.genre = genre || book.genre;
      book.summary = summary || book.summary;

      if (count !== undefined) {
        const parsedCount = parseInt(count, 10);
        if (isNaN(parsedCount) || parsedCount < 0) {
          return res.status(400).json({ success: false, error: "Invalid count value" });
        }
        book.count = parsedCount;
        if (book.available > book.count) {
          book.available = book.count;
        }
      }

      if (available !== undefined) {
        const parsedAvailable = parseInt(available, 10);
        if (isNaN(parsedAvailable) || parsedAvailable < 0) {
          return res.status(400).json({ success: false, error: "Invalid available value" });
        }
        if (parsedAvailable > book.count) {
          return res.status(400).json({ success: false, error: "Available count cannot exceed total count" });
        }
        book.available = parsedAvailable;
      }

      const { uploadPDF, uploadThumbnail, uploadVideo } = req.files;

      if (uploadPDF && uploadPDF.length > 0) {
        const newPdf = uploadPDF[0].path;
        const updatedPdf = await updateCloudinary(book.pdfCloudinary.public_id, newPdf, "books/pdf");
        book.pdfCloudinary = updatedPdf;
        if (fs.existsSync(newPdf)) fs.unlinkSync(newPdf);
      }

      if (uploadThumbnail && uploadThumbnail.length > 0) {
        const newThumbnail = uploadThumbnail[0].path;
        const updatedThumbnail = await updateCloudinary(book.thumbnailCloudinary.public_id, newThumbnail, "books/thumbnails");
        book.thumbnailCloudinary = updatedThumbnail;
        if (fs.existsSync(newThumbnail)) fs.unlinkSync(newThumbnail);
      }

      if (uploadVideo && uploadVideo.length > 0) {
        const newVideo = uploadVideo[0].path;
        const updatedVideo = await updateCloudinary(book.videoCloudinary.public_id, newVideo, "books/videos");
        book.videoCloudinary = updatedVideo;
        if (fs.existsSync(newVideo)) fs.unlinkSync(newVideo);
      }

      await book.save();
      res.json({ success: true, book });
    } catch (err) {
      console.error("Update book error:", err);
      res.status(500).json({ success: false, error: err.message || "Internal server error" });
    }
  }
);

// ------------------ DELETE BOOK ------------------
router.delete("/delete/:id", fetchUser, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    // ✅ Prevent deletion if the book is currently borrowed
    const currentlyBorrowed = book.borrowers.some(b => b.borrowed === true);
    if (currentlyBorrowed) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete book while it is borrowed by users",
      });
    }

    // ✅ Delete Cloudinary assets (if exist)
    if (book.pdfCloudinary?.public_id) {
      await deleteFromCloudinary(book.pdfCloudinary.public_id);
    }
    if (book.thumbnailCloudinary?.public_id) {
      await deleteFromCloudinary(book.thumbnailCloudinary.public_id);
    }
    if (book.videoCloudinary?.public_id) {
      await deleteFromCloudinary(book.videoCloudinary.public_id);
    }

    // ✅ Finally, delete the book from DB
    await book.deleteOne();

    return res.json({ success: true, message: "Book deleted successfully" });

  } catch (err) {
    console.error("Delete book error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ------------------ FORCE DELETE BOOK (Admin) ------------------
router.delete("/forceDelete/:id", fetchUser, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    // ✅ Delete Cloudinary assets (if present)
    if (book.pdfCloudinary?.public_id) {
      await deleteFromCloudinary(book.pdfCloudinary.public_id);
    }
    if (book.thumbnailCloudinary?.public_id) {
      await deleteFromCloudinary(book.thumbnailCloudinary.public_id);
    }
    if (book.videoCloudinary?.public_id) {
      await deleteFromCloudinary(book.videoCloudinary.public_id);
    }

    // ✅ Optionally: remove references from users who have this book in their borrowed list
    // Only if needed:
    // await User.updateMany(
    //   { "books.book": book._id },
    //   { $pull: { books: { book: book._id } } }
    // );

    // ✅ Delete the book record
    await book.deleteOne();

    res.json({ success: true, message: "Book forcibly deleted" });
  } catch (err) {
    console.error("Force delete book error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;