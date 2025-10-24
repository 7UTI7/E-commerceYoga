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
    // Pega o :slug da URL (ex: /api/articles/como-meditar)
    const { slug } = req.params;

    // Encontra o artigo que tenha o slug E esteja publicado
    const article = await Article.findOne({
      slug: slug,
      status: 'PUBLISHED',
    });

    if (article) {
      // Se achou, retorna o artigo
      res.status(200).json(article);
    } else {
      // Se não achar (ou se for um 'DRAFT'), retorna 404
      res.status(404).json({ message: 'Artigo não encontrado ou não publicado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar artigo.' });
  }
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

module.exports = {
  getPublishedArticles,
  getArticleBySlug,
  createArticle,
};