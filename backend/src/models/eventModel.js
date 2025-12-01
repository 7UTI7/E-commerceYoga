const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'O título é obrigatório.'],
    },
    description: {
      type: String,
      required: [true, 'A descrição é obrigatória.'],
    },
    date: {
      type: Date, 
      required: [true, 'A data do evento é obrigatória.'],
    },
    location: {
      type: String, 
      required: [true, 'O local é obrigatório.'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    coverImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;