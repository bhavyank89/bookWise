import mongoose from 'mongoose';
import Book from './Book.js';

// ✅ Tracks current borrow/request state
const ActiveBorrowSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  borrowed: {
    type: Boolean,
    default: false,
  },
  borrowedAt: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  returnedAt: {
    type: Date,
    default: null,
  },
  lateFine: {
    type: Number,
    default: 0,
    min: [0, 'Late fine cannot be negative'],
  },
}, { _id: false });

// ✅ Tracks full borrow history
const BorrowHistorySchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  borrowedAt: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  returnedAt: {
    type: Date,
    default: null,
  },
  lateFine: {
    type: Number,
    default: 0,
    min: [0, 'Late fine cannot be negative'],
  },
}, { _id: false });

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
    // ✅ Active/pending borrow state
    borrowedBooks: {
      type: [ActiveBorrowSchema],
      default: [],
    },

    // ✅ Full borrow-return cycle
    borrowHistory: {
      type: [BorrowHistorySchema],
      default: [],
    },

    savedBooks: [SavedBookSchema],

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
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'User',
    },

    uniId: {
      type: String,
      required: function () {
        return this.role === 'User';
      },
    },

    uniIdDoc: {
      type: Object,
      required: function () {
        return this.role === 'User';
      },
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

// 📌 Compound unique index on { email, role }
UserSchema.index({ email: 1, role: 1 }, { unique: true });

// 📌 Auto-calculate dueDate if not set
UserSchema.pre('save', function (next) {
  this.borrowedBooks.forEach(b => {
    if (!b.dueDate && b.borrowedAt) {
      b.dueDate = new Date(b.borrowedAt.getTime() + 15 * 24 * 60 * 60 * 1000);
    }
  });
  next();
});

// ✅ METHOD: Return Book
UserSchema.methods.returnBook = async function (bookId) {
  const bookIndex = this.borrowedBooks.findIndex(b => b.book.toString() === bookId.toString());
  if (bookIndex === -1) throw new Error('Book not found in user record');

  const bookRef = await Book.findById(bookId);
  if (!bookRef) throw new Error('Book not found');

  const returnedBook = this.borrowedBooks[bookIndex];

  // ✅ Push to borrowHistory
  this.borrowHistory.push({
    book: returnedBook.book,
    requestedAt: returnedBook.requestedAt,
    borrowedAt: returnedBook.borrowedAt,
    dueDate: returnedBook.dueDate,
    returnedAt: new Date(),
    lateFine: returnedBook.lateFine || 0,
  });

  // Remove from active
  this.borrowedBooks.splice(bookIndex, 1);
  await this.save();

  // Update book model accordingly
  bookRef.available += 1;
  bookRef.borrowers = bookRef.borrowers.filter(b => b.user.toString() !== this._id.toString());
  bookRef.borrowHistory.push({
    user: this._id,
    requestedAt: returnedBook.requestedAt,
    borrowedAt: returnedBook.borrowedAt,
    dueDate: returnedBook.dueDate,
    returnedAt: new Date(),
    lateFine: returnedBook.lateFine || 0,
  });

  await bookRef.save();
};

// ✅ METHOD: Get Overdue Books
UserSchema.methods.getOverdueBooks = function () {
  const now = new Date();
  return this.borrowedBooks.filter(b => b.dueDate && b.dueDate < now);
};

// ✅ VIRTUALS
UserSchema.virtual('totalBorrowed').get(function () {
  return this.borrowedBooks.length;
});
UserSchema.virtual('overdueCount').get(function () {
  return this.getOverdueBooks().length;
});
UserSchema.virtual('totalSavedBooks').get(function () {
  return this.savedBooks.length;
});

// ✅ METHOD: Populate All References
UserSchema.methods.populateAll = function () {
  return this.populate([
    { path: 'borrowedBooks.book' },
    { path: 'savedBooks.book' },
    { path: 'borrowHistory.book' },
  ]);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
