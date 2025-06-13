import mongoose from 'mongoose';

const BorrowerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  borrowed: {
    type: Boolean,
    default: false,
  },
  borrowedAt: {
    type: Date,
    default: Date.now,
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
});


const BookSchema = new mongoose.Schema(
  {
    // Physical borrowers (users who borrowed physical copies)
    borrowers: {
      type: [BorrowerSchema],
      default: [], // ✅ Prevent undefined
    },


    // Users who saved/marked this eBook
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

    // Total physical book count (>=0), required only if physical or both
    count: {
      type: Number,
      min: [0, 'Count cannot be negative'],
      default: 0,
    },

    // Currently available physical books (>=0 and <= count)
    available: {
      type: Number,
      min: [0, 'Available count cannot be negative'],
      // will be set in pre-validate hook if physical copy exists
    },

    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },

    // Optional Cloudinary file objects for ebook and media
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

// Helper method to check if book is physical only or physical+ebook
BookSchema.methods.isPhysical = function () {
  return this.count > 0;
};

// Helper method to check if book has ebook
BookSchema.methods.isEbook = function () {
  return this.pdfCloudinary !== null && this.pdfCloudinary !== undefined;
};

// Pre-validate hook for custom validation
BookSchema.pre('validate', function (next) {
  // Title, Author, Summary required - handled by schema

  const isPhysical = this.isPhysical();
  const isEbook = this.isEbook();

  // Validation for physical book count
  if (isPhysical) {
    if (this.count === undefined || this.count === null) {
      this.invalidate('count', 'Count is required for physical books');
    } else if (this.count < 0) {
      this.invalidate('count', 'Count cannot be negative');
    }
  } else {
    // If not physical, ensure count is zero or undefined
    this.count = 0;
  }

  // Available handling - only if physical
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
    this.available = 0; // no physical copy, so no availability
  }

  // Validation for ebook - pdfCloudinary required if ebook or both
  // Thumbnail is required for all book types
  if (!this.thumbnailCloudinary || Object.keys(this.thumbnailCloudinary).length === 0) {
    this.invalidate('thumbnailCloudinary', 'Thumbnail image is required for all books');
  }

  // PDF is required if ebook or both
  if (this.bookType === 'ebook' || this.bookType === 'both') {
    if (!this.pdfCloudinary || Object.keys(this.pdfCloudinary).length === 0) {
      this.invalidate('pdfCloudinary', 'PDF file is required for ebooks');
    }
  }
  else {
    // If no ebook, pdfCloudinary and thumbnailCloudinary can be null
    if (this.pdfCloudinary) this.pdfCloudinary = null;
  }

  next();
});

// Pre-save hook to sync available with count if count changes
BookSchema.pre('save', function (next) {
  if (this.isModified('count')) {
    if (this.count < 0) {
      this.count = 0;
    }
    // Sync available only if physical copy exists
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
