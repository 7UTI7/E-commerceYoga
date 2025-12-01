const mongoose = require('mongoose');

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

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'O título é obrigatório.'],
    },
    description: {
      type: String,
      required: [true, 'A descrição é obrigatória.'],
    },
    youtubeUrl: {
      type: String,
      required: [true, 'A URL do YouTube é obrigatória.'],
    },
    category: {
      type: String,
      required: [true, 'A categoria é obrigatória.'],
      default: 'Geral',
    },
    level: {
      type: String,
      enum: ['Iniciante', 'Intermediário', 'Avançado', 'Todos'],
      default: 'Todos',
    },
    
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    comments: [commentSchema], 
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;