const mongoose = require('mongoose');
const slugify = require('slugify');
const crypto = require('crypto');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'O título é obrigatório.'],
        },
    // slug é a URL amigável, ex: "como-meditar-em-5-minutos"
    slug: {
      type: String,
      // required: [true, 'O slug é obrigatório.'],
      unique: true,
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

articleSchema.pre('save', function (next) {
  // Rode APENAS se o 'title' foi modificado
  // OU se for um documento novo (para o caso de updates onde o título não muda)
  if (this.isModified('title') || this.isNew) {
    
    // 1. Gera o slug base
    const baseSlug = slugify(this.title, { 
      lower: true,  
      strict: true, 
    });

    // 2. Gera 4 caracteres aleatórios (ex: 'a1b2')
    const randomChars = crypto.randomBytes(4).toString('hex').slice(0, 4);

    // 3. Combina os dois para garantir que seja único
    this.slug = `${baseSlug}-${randomChars}`;
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;