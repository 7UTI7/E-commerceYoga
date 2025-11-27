const Article = require('../models/articleModel.js');

// @desc    Buscar todos os artigos PUBLICADOS
// @route   GET /api/articles
// @access  Public
const getPublishedArticles = async (req, res) => {
  try {
    // Traz a coverImage junto
    const articles = await Article.find({ status: 'PUBLISHED' })
      .sort({ createdAt: -1 })
      .populate('author', 'name avatar'); // Traz foto do autor tbm

    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar artigos.' });
  }
}

const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const article = await Article.findOne({
      slug: slug,
      status: 'PUBLISHED',
    })
    .populate('author', 'name avatar') 
    .populate('comments.author', 'name avatar'); 

    if (article) {
      res.status(200).json(article);
    } else {
      res.status(404).json({ message: 'Artigo não encontrado ou não publicado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar artigo.' });
  }
};

// --- ADMIN ---

// @desc    Criar um novo artigo
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = async (req, res) => {
  try {
    // 1. ADICIONADO: coverImage aqui
    const { title, content, slug, status, coverImage } = req.body;

    const slugExists = await Article.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ message: 'Este "slug" (URL) já está em uso.' });
    }

    const article = new Article({
      title,
      slug,
      content,
      status, 
      coverImage, // 2. ADICIONADO: Salva a imagem no banco
      author: req.user._id,
    });

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
    // 1. ADICIONADO: coverImage aqui
    const { title, content, slug, status, coverImage } = req.body;
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Artigo não encontrado.' });
    }

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
    
    // 2. ADICIONADO: Atualiza a imagem se ela vier
    if (coverImage) {
        article.coverImage = coverImage;
    }

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

    await article.deleteOne();
    
    res.status(200).json({ message: 'Artigo deletado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar artigo.' });
  }
};

// @desc    Criar um novo comentário
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
        author: req.user._id, 
      };

      article.comments.unshift(comment);

      await article.save();
      
      // Popula avatar também
      const populatedArticle = await Article.findById(article._id).populate('comments.author', 'name avatar');
      
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