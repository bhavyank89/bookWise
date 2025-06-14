import mongoose from 'mongoose';

// ✅ Single borrow record for a user (past or current)
const BorrowRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

// ✅ Tracks current/pending borrow requests
const ActiveBorrowerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

const BookSchema = new mongoose.Schema(
  {
    // ✅ Current/pending borrowers
    borrowers: {
      type: [ActiveBorrowerSchema],
      default: [],
    },

    // ✅ Full borrow history (can include same user multiple times)
    borrowHistory: {
      type: [BorrowRecordSchema],
      default: [],
    },

    // ✅ Users who saved this eBook
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    bookType: {
      type: String,
      enum: ['physical', 'ebook', 'both'],
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },

    count: {
      type: Number,
      min: [0, 'Count cannot be negative'],
      default: 0,
    },
    available: {
      type: Number,
      min: [0, 'Available count cannot be negative'],
    },

    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },

    pdfCloudinary: {
      type: Object,
      default: null,
    },
    thumbnailCloudinary: {
      type: Object,
      default: null,
    },
    videoCloudinary: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper methods
BookSchema.methods.isPhysical = function () {
  return this.count > 0;
};

BookSchema.methods.isEbook = function () {
  return this.pdfCloudinary !== null && this.pdfCloudinary !== undefined;
};

// Pre-validation
BookSchema.pre('validate', function (next) {
  const isPhysical = this.isPhysical();
  const isEbook = this.isEbook();

  if (isPhysical) {
    if (this.count === undefined || this.count === null) {
      this.invalidate('count', 'Count is required for physical books');
    } else if (this.count < 0) {
      this.invalidate('count', 'Count cannot be negative');
    }
  } else {
    this.count = 0;
  }

  if (isPhysical) {
    if (this.available === undefined || this.available === null) {
      this.available = this.count;
    }
    if (this.available > this.count) {
      this.invalidate('available', 'Available count cannot exceed total count');
    }
    if (this.available < 0) {
      this.invalidate('available', 'Available count cannot be negative');
    }
  } else {
    this.available = 0;
  }

  if (!this.thumbnailCloudinary || Object.keys(this.thumbnailCloudinary).length === 0) {
    this.invalidate('thumbnailCloudinary', 'Thumbnail image is required for all books');
  }

  if (this.bookType === 'ebook' || this.bookType === 'both') {
    if (!this.pdfCloudinary || Object.keys(this.pdfCloudinary).length === 0) {
      this.invalidate('pdfCloudinary', 'PDF file is required for ebooks');
    }
  } else {
    this.pdfCloudinary = null;
  }

  next();
});

// Pre-save hook
BookSchema.pre('save', function (next) {
  if (this.isModified('count')) {
    if (this.count < 0) this.count = 0;
    if (this.count > 0) {
      this.available = this.count;
    } else {
      this.available = 0;
    }
  }
  next();
});

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);
export default Book;
