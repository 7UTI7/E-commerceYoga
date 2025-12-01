const mongoose = require('mongoose');

const classSlotSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'O título da aula é obrigatório.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A descrição é obrigatória.'],
    },
    
    dateTime: {
      type: Date,
      required: [true, 'A data e hora da aula são obrigatórias.'],
    },
    durationMinutes: {
      type: Number, 
      required: [true, 'A duração é obrigatória.'],
      min: 30,
    },
    maxStudents: {
      type: Number, 
      required: [true, 'O limite de vagas é obrigatório.'],
      default: 10,
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
  },
  {
    timestamps: true,
  }
);


classSlotSchema.index({ dateTime: 1, author: 1 }, { unique: true });

const ClassSlot = mongoose.model('ClassSlot', classSlotSchema);

module.exports = ClassSlot;