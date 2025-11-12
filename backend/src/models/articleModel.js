const mongoose = require('mongoose');
const slugify = require('slugify');

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

// NOVO: Hook (gancho) que roda ANTES de salvar ('.save()')
articleSchema.pre('save', function (next) {
  // Verifique se o título foi modificado (para não gerar um novo slug
  // toda vez que o usuário editar o *conteúdo*, por exemplo)
  if (this.isModified('title')) {
    // Cria o slug a partir do título
    // ex: "Meu Título!" -> "meu-titulo"
    this.slug = slugify(this.title, { 
      lower: true,  // Força minúsculas
      strict: true, // Remove caracteres especiais (como '!')
    });
    
    // NOTA: Isso não trata duplicatas (ex: dois artigos com o mesmo título).
    // Para um MVP, isso é suficiente. Podemos adicionar um hash aleatório
    // (ex: slug + '-' + crypto.randomBytes(4).toString('hex')) depois, se necessário.
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;