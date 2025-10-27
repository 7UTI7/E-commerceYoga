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

module.exports = {
  getPublishedArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
};