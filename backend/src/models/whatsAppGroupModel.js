const mongoose = require('mongoose');

const whatsAppGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome do grupo é obrigatório.'],
      trim: true,
    },
    description: {
      type: String,
    },
    joinLink: {
      type: String,
      required: [true, 'O link de convite é obrigatório.'],
    },
    // Referência ao Admin que criou o grupo
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

const WhatsAppGroup = mongoose.model('WhatsAppGroup', whatsAppGroupSchema);

module.exports = WhatsAppGroup;