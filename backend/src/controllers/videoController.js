const Video = require('../models/videoModel');

// --- ROTAS PÚBLICAS ---

// @desc    Buscar todos os vídeos
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res) => {
  try {
    // Ordena pelos mais recentes
    const videos = await Video.find({}).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vídeos.' });
  }
};

// @desc    Buscar um único vídeo pelo ID
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (video) {
      res.status(200).json(video);
    } else {
      res.status(404).json({ message: 'Vídeo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vídeo.' });
  }
};

// --- ROTAS DE ADMIN ---

// @desc    Criar um novo vídeo
// @route   POST /api/videos
// @access  Private/Admin
const createVideo = async (req, res) => {
  try {
    const { title, description, youtubeUrl, category } = req.body;

    const video = new Video({
      title,
      description,
      youtubeUrl,
      category,
      author: req.user._id, // Vem do middleware 'protect'
    });

    const createdVideo = await video.save();
    res.status(201).json(createdVideo);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar vídeo.' });
  }
};

// @desc    Atualizar um vídeo
// @route   PUT /api/videos/:id
// @access  Private/Admin
const updateVideo = async (req, res) => {
  try {
    const { title, description, youtubeUrl, category } = req.body;
    const video = await Video.findById(req.params.id);

    if (video) {
      video.title = title || video.title;
      video.description = description || video.description;
      video.youtubeUrl = youtubeUrl || video.youtubeUrl;
      video.category = category || video.category;

      const updatedVideo = await video.save();
      res.status(200).json(updatedVideo);
    } else {
      res.status(404).json({ message: 'Vídeo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar vídeo.' });
  }
};

// @desc    Deletar um vídeo
// @route   DELETE /api/videos/:id
// @access  Private/Admin
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (video) {
      await video.deleteOne();
      res.status(200).json({ message: 'Vídeo deletado com sucesso.' });
    } else {
      res.status(404).json({ message: 'Vídeo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar vídeo.' });
  }
};

module.exports = {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};