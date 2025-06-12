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
router.post(
  "/createbook",
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

      // Validate required base fields
      if (!title || !author || !summary || !bookType) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: title, author, summary, and bookType are required.",
        });
      }

      // Validate bookType enum
      if (!["physical", "ebook", "both"].includes(bookType)) {
        return res.status(400).json({
          success: false,
          error: "Invalid bookType. Must be one of: physical, ebook, both.",
        });
      }

      // Parse count to number (physical copies count)
      let count = parseInt(countRaw, 10);
      if (isNaN(count)) count = 0;

      // For physical or both, count must be >= 0 and required
      if ((bookType === "physical" || bookType === "both") && count < 0) {
        return res.status(400).json({
          success: false,
          error: "Count must be a non-negative integer for physical books.",
        });
      }

      // For ebook or both, PDF and thumbnail are required files
      const pdfFile = req.files?.uploadPDF?.[0];
      const thumbnailFile = req.files?.uploadThumbnail?.[0];
      const videoFile = req.files?.uploadVideo?.[0]; // optional

      // For ebook or both, PDF and thumbnail are required files
      // For physical, only thumbnail is required (PDF not needed)

      if (bookType === "ebook" || bookType === "both") {
        if (!pdfFile) {
          return res.status(400).json({
            success: false,
            error: "PDF file is required for ebooks.",
          });
        }
        if (!thumbnailFile) {
          return res.status(400).json({
            success: false,
            error: "Thumbnail image is required for ebooks.",
          });
        }
      }

      // For physical, thumbnail is still required (even if PDF is not)
      if (bookType === "physical" && !thumbnailFile) {
        return res.status(400).json({
          success: false,
          error: "Thumbnail image is required for physical books.",
        });
      }


      // For physical-only books, no PDF or thumbnail is required
      // So, skip error if missing in that case

      // Upload files to Cloudinary (only those that exist)
      let pdfResult = null,
        thumbnailResult = null,
        videoResult = null;

      try {
        const uploadPromises = [
          pdfFile ? uploadToCloudinary(pdfFile.path, "books/pdf") : Promise.resolve(null),
          thumbnailFile
            ? uploadToCloudinary(thumbnailFile.path, "books/thumbnails")
            : Promise.resolve(null),
          videoFile ? uploadToCloudinary(videoFile.path, "books/videos") : Promise.resolve(null),
        ];

        [pdfResult, thumbnailResult, videoResult] = await Promise.all(uploadPromises);
      } catch (uploadError) {
        // Clean up local files if upload failed
        [pdfFile, thumbnailFile, videoFile].forEach((file) => {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
        return res.status(500).json({
          success: false,
          error: "File upload failed",
          details: uploadError.message || uploadError,
        });
      }

      // After upload success, delete local files
      [pdfFile, thumbnailFile, videoFile].forEach((file) => {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });

      // Construct the new Book document
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
      };

      // Set count and available only if physical or both
      if (bookType === "physical" || bookType === "both") {
        bookData.count = count;
        bookData.available = count;
      } else {
        // For ebooks only, count and available = 0
        bookData.count = 0;
        bookData.available = 0;
      }

      // Save book to DB (schema pre-validate hook will run and validate)
      const newBook = new Book(bookData);
      await newBook.validate(); // explicitly validate to catch any errors early

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


// ------------------ SAVE EBOOK ONLY ------------------
router.post("/saveebook", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

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

    // Check if already saved
    const alreadySaved = user.savedBooks.some(saved => saved.book.toString() === bookId);
    if (alreadySaved) {
      return res.status(400).json({ success: false, error: "Book already saved" });
    }

    // Save the book
    user.savedBooks.push({ book: bookId });
    await user.save();

    return res.status(200).json({ success: true, message: "Book saved successfully", savedBooks: user.savedBooks });
  } catch (error) {
    console.error("Save ebook error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ------------------ BORROW BOOK ------------------
router.post('/borrow/:id', async (req, res) => {
  const user_Id = req.body.user_Id;
  const book_Id = req.params.id;

  try {
    const book = await Book.findById(book_Id);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    // ✅ Check if user already borrowed this book
    const alreadyBorrowed = book.borrowers.find(
      (entry) => entry.user.toString() === user_Id && entry.borrowed === true
    );
    if (alreadyBorrowed) {
      return res.status(400).json({ success: false, error: "User has already borrowed this book" });
    }

    // ✅ Check availability
    if (book.available <= 0) {
      return res.status(400).json({ success: false, error: "Book not available right now" });
    }

    // ✅ Check for existing unconfirmed request
    const existingRequest = book.borrowers.find(
      (entry) => entry.user.toString() === user_Id && entry.borrowed === false
    );

    const borrowedAt = new Date();
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    if (existingRequest) {
      existingRequest.borrowed = true;
      existingRequest.borrowedAt = borrowedAt;
      existingRequest.dueDate = dueDate;
    } else {
      book.borrowers.push({
        user: user_Id,
        borrowed: true,
        borrowedAt,
        dueDate,
      });
    }

    // ✅ Update user's borrowed list
    const user = await User.findById(user_Id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if already in user's borrowed book list
    const alreadyInUserList = user.books.find(
      (b) => b.book.toString() === book_Id && b.returned === false
    );

    if (!alreadyInUserList) {
      user.books.push({
        book: book_Id,
        borrowedAt,
        dueDate,
      });
    }

    // ✅ Update book availability and save
    book.available -= 1;
    await book.save();
    await user.save();

    res.status(200).json({ success: true, message: "Book Borrowed Successfully!!" });

  } catch (error) {
    console.error("Borrow route error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});


// ------------------ UPDATE BOOK ------------------
// Added fetchUser middleware here for authentication protection
router.put(
  "/update/:id",
  fetchUser,
  upload.fields([
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
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    // Delete all files from Cloudinary
    if (book.pdfCloudinary?.public_id) {
      await deleteFromCloudinary(book.pdfCloudinary.public_id);
    }
    if (book.thumbnailCloudinary?.public_id) {
      await deleteFromCloudinary(book.thumbnailCloudinary.public_id);
    }
    if (book.videoCloudinary?.public_id) {
      await deleteFromCloudinary(book.videoCloudinary.public_id);
    }

    res.json({ success: true, message: "Book deleted" });
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

    // Remove borrowers references or any other forced cleanup here if needed
    await book.deleteOne();

    // Delete cloudinary files
    if (book.pdfCloudinary?.public_id) {
      await deleteFromCloudinary(book.pdfCloudinary.public_id);
    }
    if (book.thumbnailCloudinary?.public_id) {
      await deleteFromCloudinary(book.thumbnailCloudinary.public_id);
    }
    if (book.videoCloudinary?.public_id) {
      await deleteFromCloudinary(book.videoCloudinary.public_id);
    }

    res.json({ success: true, message: "Book forcibly deleted" });
  } catch (err) {
    console.error("Force delete book error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ------------------ FETCH BORROWERS ------------------
router.get("/borrowers/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).sort({ createdAt: -1 });
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    res.json({ success: true, borrowers: book.borrowers });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching borrowers"
    });
  }
});

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

// ------------------ RETURN BOOK ------------------
router.post("/return/:id", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    // ✅ Find the borrow entry for this user in the book
    const borrowerEntry = book.borrowers.find(
      (b) => b.user.toString() === userId && b.borrowed === true
    );

    if (!borrowerEntry) {
      return res.status(400).json({ success: false, error: "You haven't borrowed this book" });
    }

    const returnedAt = new Date();
    borrowerEntry.returnedAt = returnedAt;
    borrowerEntry.borrowed = false;

    // ✅ Compute late fine
    let lateFine = 0;
    if (borrowerEntry.dueDate) {
      const dueDate = new Date(borrowerEntry.dueDate);
      const lateDays = Math.ceil((returnedAt - dueDate) / (1000 * 60 * 60 * 24));
      if (lateDays > 0) {
        lateFine = lateDays * 10; // ₹10 per late day
      }
    }
    borrowerEntry.lateFine = lateFine;

    // ✅ Update availability count
    book.available += 1;
    await book.save();

    // ✅ Update user.books list as well
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userBorrowEntry = user.books.find(
      (b) => b.book.toString() === bookId && b.returned === false
    );

    if (userBorrowEntry) {
      userBorrowEntry.returned = true;
      userBorrowEntry.returnedAt = returnedAt;
      userBorrowEntry.lateFine = lateFine;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Book returned successfully",
      returnedAt,
      lateFine,
    });

  } catch (error) {
    console.error("Return book error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});


// Fetch all borrow requests (pending + fulfilled)
router.get('/all-borrow-requests', async (req, res) => {
  try {
    const books = await Book.find({
      borrowers: { $exists: true, $ne: [], $type: "array" }
    }).sort({ createdAt: -1 });

    const allRequests = [];

    for (const book of books) {
      const borrowers = book?.borrowers;

      if (!Array.isArray(borrowers) || borrowers.length === 0) {
        continue;
      }

      for (const entry of borrowers) {
        const user = await User.findById(entry.user).lean(); // .lean() for performance
        if (!user) continue;

        allRequests.push({
          bookId: book._id,
          title: book.title,
          author: book.author,
          genre:book.genre,
          bookThumbnailCloudinary: book.thumbnailCloudinary,
          bookType: book.bookType,
          user: entry.user,
          userThumbnailCloudinary: user.avatar || null,
          userName: user.name || "Unknown User",
          userEmail: user.email || "Unknown Email",
          borrowed: entry.borrowed,
          requestedAt: entry.requestedAt || entry.createdAt || null,
          borrowedAt: entry.borrowedAt || null,
          dueDate: entry.dueDate || null,
          returnedAt: entry.returnedAt || null,
          lateFine: entry.lateFine || 0,
        });
      }
    }

    return res.status(200).json({ success: true, requests: allRequests });
  } catch (error) {
    console.error("Error fetching all borrow requests:", error?.message || error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});






export default router;
