const mongoose = require('mongoose');

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
    // Aqui a professora vai colar a URL do YouTube
    // Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ
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
    // Referência ao Admin que fez o upload
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;