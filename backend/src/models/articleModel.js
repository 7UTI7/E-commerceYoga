const mongoose = require('mongoose');
const slugify = require('slugify');
const crypto = require('crypto');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', 
    },
  },
  { timestamps: true }
);

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'O título é obrigatório.'],
        },
    
    slug: {
      type: String,
      
      unique: true,
      lowercase: true,
    },
    content: {
      type: String, 
      required: [true, 'O conteúdo é obrigatório.'],
    },
    coverImage: {
      type: String, 
    },
    
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', 
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'], 
      default: 'DRAFT', 
    },
    comments: [commentSchema], 
  },
  {
    timestamps: true, 
  }
);

articleSchema.pre('save', function (next) {
  
  if (this.isModified('title') || this.isNew) {
    
    
    const baseSlug = slugify(this.title, { 
      lower: true,  
      strict: true, 
    });

    
    const randomChars = crypto.randomBytes(4).toString('hex').slice(0, 4);

    
    this.slug = `${baseSlug}-${randomChars}`;
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;