import mongoose from 'mongoose';
import Book from './Book.js';

const BorrowedBookSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  borrowedOn: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
  },
});

const SavedBookSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  savedOn: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new mongoose.Schema(
  {
    books: [BorrowedBookSchema], // Borrowed books

    savedBooks: [SavedBookSchema], // 📌 NEW: Saved ebooks or wishlist

    avatar: {
      type: Object,
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    uniId: {
      type: String,
      required: [true, 'University ID is required'],
    },
    uniIdDoc: {
      type: Object,
      required: [true, 'University ID is required'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

///////////////////////////////////////////////////////
// 📌 Auto-calculate dueDate if not provided
///////////////////////////////////////////////////////
UserSchema.pre('save', function (next) {
  this.books.forEach(book => {
    if (!book.dueDate && book.borrowedOn) {
      book.dueDate = new Date(book.borrowedOn.getTime() + 15 * 24 * 60 * 60 * 1000);
    }
  });
  next();
});

///////////////////////////////////////////////////////
// ✅ METHOD: Return a Book
///////////////////////////////////////////////////////
UserSchema.methods.returnBook = async function (bookId) {
  const bookIndex = this.books.findIndex(b => b.book.toString() === bookId.toString());

  if (bookIndex === -1) throw new Error('Book not found in user record');

  this.books.splice(bookIndex, 1); // Remove from user
  await this.save();

  // Update Book model
  const book = await Book.findById(bookId);
  if (!book) throw new Error('Book not found');

  book.available += 1;

  // Remove user from book.borrowers
  book.borrowers = book.borrowers.filter(borrowerId => borrowerId.toString() !== this._id.toString());
  await book.save();
};

///////////////////////////////////////////////////////
// ✅ METHOD: Get Overdue Books
///////////////////////////////////////////////////////
UserSchema.methods.getOverdueBooks = function () {
  const now = new Date();
  return this.books.filter(book => book.dueDate && book.dueDate < now);
};

///////////////////////////////////////////////////////
// ✅ VIRTUAL: Total Borrowed Books
///////////////////////////////////////////////////////
UserSchema.virtual('totalBorrowed').get(function () {
  return this.books.length;
});

///////////////////////////////////////////////////////
// ✅ VIRTUAL: Total Overdue Count
///////////////////////////////////////////////////////
UserSchema.virtual('overdueCount').get(function () {
  return this.getOverdueBooks().length;
});

///////////////////////////////////////////////////////
// ✅ VIRTUAL: Total Saved Books
///////////////////////////////////////////////////////
UserSchema.virtual('totalSavedBooks').get(function () {
  return this.savedBooks.length;
});

///////////////////////////////////////////////////////

// ✅ METHOD: Populate All References
UserSchema.methods.populateAll = function () {
  return this.populate([
    { path: 'books.book' },
    { path: 'savedBooks.book' }
  ]);
};


const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
