import mongoose from 'mongoose';

const BorrowRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedAt: { type: Date, default: Date.now },
  borrowedAt: { type: Date },
  dueDate: { type: Date },
  returnedAt: { type: Date, default: null },
  lateFine: { type: Number, default: 0, min: [0, 'Late fine cannot be negative'] },
}, { _id: false });

const ActiveBorrowerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedAt: { type: Date, default: Date.now },
  borrowed: { type: Boolean, default: false },
  borrowedAt: { type: Date },
  dueDate: { type: Date },
  returnedAt: { type: Date, default: null },
  lateFine: { type: Number, default: 0, min: [0, 'Late fine cannot be negative'] },
}, { _id: false });

const BookSchema = new mongoose.Schema({
  borrowers: {
    type: [ActiveBorrowerSchema],
    default: [],
  },
  borrowHistory: {
    type: [BorrowRecordSchema],
    default: [],
  },
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

  // File-based or URL-based options
  pdfCloudinary: { type: Object, default: null },    // if uploaded
  pdfURL: { type: String, default: null },           // if linked

  thumbnailCloudinary: { type: Object, default: null },
  thumbnailURL: { type: String, default: null },

  videoCloudinary: { type: Object, default: null },
  videoURL: { type: String, default: null },
}, {
  timestamps: true,
});

// Helpers
BookSchema.methods.isPhysical = function () {
  return this.bookType === 'physical' || this.bookType === 'both';
};
BookSchema.methods.isEbook = function () {
  return this.bookType === 'ebook' || this.bookType === 'both';
};

function isNonEmpty(obj) {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
}

// Pre-validation
BookSchema.pre('validate', function (next) {
  const isPhysical = this.isPhysical();
  const isEbook = this.isEbook();

  // Physical books
  if (isPhysical) {
    if (this.count == null || this.count < 0) {
      this.invalidate('count', 'Count is required and must be >= 0 for physical books');
    }
    if (this.available == null || this.available < 0) {
      this.available = this.count;
    }
    if (this.available > this.count) {
      this.invalidate('available', 'Available count cannot exceed total count');
    }
  } else {
    this.count = 0;
    this.available = 0;
  }

  // At least one of Cloudinary or direct URL for thumbnail
  if (!isNonEmpty(this.thumbnailCloudinary) && !this.thumbnailURL) {
    this.invalidate('thumbnailCloudinary', 'Thumbnail is required (file or URL)');
  }

  // Ebooks require PDF
  if (isEbook) {
    if (!isNonEmpty(this.pdfCloudinary) && !this.pdfURL) {
      this.invalidate('pdfCloudinary', 'PDF is required for ebooks (file or URL)');
    }
  } else {
    this.pdfCloudinary = null;
    this.pdfURL = null;
  }

  next();
});

// Pre-save
BookSchema.pre('save', function (next) {
  if (this.isModified('count')) {
    if (this.count < 0) this.count = 0;
    this.available = this.count;
  }
  next();
});

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);
export default Book;
