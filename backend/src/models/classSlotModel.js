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
    // Data e hora que a aula COMEÇA
    dateTime: {
      type: Date,
      required: [true, 'A data e hora da aula são obrigatórias.'],
    },
    durationMinutes: {
      type: Number, // Duração em minutos (ex: 60, 75, 90)
      required: [true, 'A duração é obrigatória.'],
      min: 30,
    },
    maxStudents: {
      type: Number, // Limite de vagas
      required: [true, 'O limite de vagas é obrigatório.'],
      default: 10,
    },
    level: {
      type: String,
      enum: ['Iniciante', 'Intermediário', 'Avançado', 'Todos'],
      default: 'Todos',
    },
    // Referência ao Admin (professora)
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

// Garantir que não haja aulas duplicadas para o mesmo horário e autor
classSlotSchema.index({ dateTime: 1, author: 1 }, { unique: true });

const ClassSlot = mongoose.model('ClassSlot', classSlotSchema);

module.exports = ClassSlot;