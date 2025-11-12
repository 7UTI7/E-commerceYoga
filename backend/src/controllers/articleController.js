const Article = require('../models/articleModel.js');

// @desc    Buscar todos os artigos PUBLICADOS
// @route   GET /api/articles
// @access  Public
const getPublishedArticles = async (req, res) => {
  try {
    // Encontra todos os artigos que tenham status 'PUBLISHED'
    // .sort({ createdAt: -1 }) ordena pelos mais recentes primeiro
    const articles = await Article.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 });

    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar artigos.' });
  }
}

const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // ATUALIZAÇÃO AQUI: Use .populate()
    const article = await Article.findOne({
      slug: slug,
      status: 'PUBLISHED',
    })
    // Popular o 'author' (quem escreveu o artigo)
    .populate('author', 'name') 
    // Popular o 'author' DENTRO do array 'comments'
    .populate('comments.author', 'name'); 

    if (article) {
      res.status(200).json(article);
    } else {
      res.status(404).json({ message: 'Artigo não encontrado ou não publicado.' });
    }
  } catch (error) { /*...*/ }
};

// --- ADMIN ---

// @desc    Criar um novo artigo
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = async (req, res) => {
  try {
    // 1. Pega os dados do body (enviados pelo Admin)
    const { title, content, slug, status } = req.body;

    // 2. Verifica se o slug já existe
    const slugExists = await Article.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ message: 'Este "slug" (URL) já está em uso.' });
    }

    // 3. Cria o artigo
    const article = new Article({
      title,
      slug,
      content,
      status, // 'DRAFT' ou 'PUBLISHED'
      author: req.user._id, // O ID do admin vem do middleware 'protect'!
    });

    // 4. Salva no banco
    const createdArticle = await article.save();
    res.status(201).json(createdArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar artigo.' });
  }
};

// @desc    Atualizar um artigo
// @route   PUT /api/articles/:id
// @access  Private/Admin
const updateArticle = async (req, res) => {
  try {
    const { title, content, slug, status } = req.body;
    const { id } = req.params; // Pega o ID do artigo da URL

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Artigo não encontrado.' });
    }

    // Verifica se o novo slug (se foi alterado) já existe em OUTRO artigo
    if (slug) {
      const slugExists = await Article.findOne({ slug: slug, _id: { $ne: id } });
      if (slugExists) {
        return res.status(400).json({ message: 'Este "slug" (URL) já está em uso por outro artigo.' });
      }
      article.slug = slug;
    }

    // Atualiza os campos
    article.title = title || article.title;
    article.content = content || article.content;
    article.status = status || article.status;
    // O autor não muda

    const updatedArticle = await article.save();
    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar artigo.' });
  }
}

// @desc    Deletar um artigo
// @route   DELETE /api/articles/:id
// @access  Private/Admin
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Artigo não encontrado.' });
    }

    await article.deleteOne(); // Novo método do Mongoose >= 7
    // ou: await article.remove(); (para Mongoose mais antigo)
    
    res.status(200).json({ message: 'Artigo deletado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar artigo.' });
  }
};

// @desc    Criar um novo comentário em um artigo
// @route   POST /api/articles/:id/comments
// @access  Private (Qualquer usuário logado)
const createArticleComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'O conteúdo do comentário é obrigatório.' });
    }

    const article = await Article.findById(req.params.id);

    if (article) {
      const comment = {
        content: content,
        author: req.user._id, // Vem do middleware 'protect'
      };

      // Adiciona o novo comentário no início do array
      article.comments.unshift(comment);

      await article.save();
      
      // Popula o autor do comentário recém-criado para devolvê-lo
      // (Opcional, mas bom para o frontend)
      const populatedArticle = await Article.findById(article._id).populate('comments.author', 'name');
      
      res.status(201).json(populatedArticle.comments[0]);
    } else {
      res.status(404).json({ message: 'Artigo não encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar comentário.' });
  }
};

module.exports = {
  getPublishedArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  createArticleComment,
};