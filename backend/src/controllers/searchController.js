const Article = require('../models/articleModel');
const Video = require('../models/videoModel');

// @desc    Buscar artigos e vídeos por palavra-chave
// @route   GET /api/search?q=termo
// @access  Public
const searchContent = async (req, res) => {
  try {
    // 1. Pegue o termo de busca da query string (ex: ?q=yoga)
    const searchTerm = req.query.q;

    // Se nenhum termo for enviado, retorne vazio
    if (!searchTerm) {
      return res.status(200).json({ articles: [], videos: [] });
    }

    // 2. Crie a expressão regular (Regex) para a busca
    // 'i' significa 'case-insensitive' (ignora maiúsculas/minúsculas)
    const regex = new RegExp(searchTerm, 'i');

    // 3. Busque em Artigos (Títulos e Conteúdo)
    // Lembre-se de respeitar a regra de "PUBLISHED"
    const articles = await Article.find({
      status: 'PUBLISHED',
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
      ],
    }).select('title slug createdAt'); // Só retorna o essencial

    // 4. Busque em Vídeos (Títulos e Descrição)
    const videos = await Video.find({
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
      ],
    }).select('title category level youtubeUrl'); // Só retorna o essencial

    // 5. Retorne os dois resultados
    res.status(200).json({ articles, videos });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao realizar a busca.' });
  }
};

module.exports = {
  searchContent,
};