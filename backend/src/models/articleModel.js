const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'O título é obrigatório.'],
        },
    // slug é a URL amigável, ex: "como-meditar-em-5-minutos"
    slug: {
      type: String,
      required: [true, 'O slug é obrigatório.'],
      unique: true, // Não pode haver dois slugs iguais
      lowercase: true,
    },
    content: {
      type: String, // Aqui virá o conteúdo (seja Markdown ou HTML)
      required: [true, 'O conteúdo é obrigatório.'],
    },
    // 'author' será o _id do Usuário (ADMIN) que criou o post
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Isso faz referência ao nosso 'userModel'
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'], // Só pode ser 'Rascunho' ou 'Publicado'
      default: 'DRAFT', // Por padrão, começa como rascunho
    },
  },
  {
    timestamps: true, // Adiciona 'createdAt' e 'updatedAt'
  }
);

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;