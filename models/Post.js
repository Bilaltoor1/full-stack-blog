import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  thumbnail: {
    type: String,
    required: true
  },
  imageGallery: [{
    url: String,
    caption: String,
    alt: String
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  downloadLinks: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['gdrive', 'mega', 'mediafire', 'dropbox', 'onedrive', 'direct', 'other'],
      default: 'direct'
    },
    size: String,
    version: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Index for search functionality
PostSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text',
  excerpt: 'text'
});

// Index for filtering and sorting
PostSchema.index({ category: 1, status: 1, publishedAt: -1 });
PostSchema.index({ subCategory: 1, status: 1, publishedAt: -1 });
PostSchema.index({ status: 1, featured: 1, publishedAt: -1 });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
