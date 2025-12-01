const Video = require('../models/videoModel');
const User = require('../models/userModel');


const getVideos = async (req, res) => {
  try {
    
    const videos = await Video.find({}).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vídeos.' });
  }
};


const getVideoById = async (req, res) => {
  try {
 
    const video = await Video.findById(req.params.id)
      .populate('author', 'name')
      .populate('comments.author', 'name avatar');

    if (video) {
      res.status(200).json(video);
    } else {
      res.status(404).json({ message: 'Vídeo não encontrado.' });
    }
  } catch (error) { /*...*/ }
};


const createVideo = async (req, res) => {
  try {
    const { title, description, youtubeUrl, category, level } = req.body;

    const video = new Video({
      title,
      description,
      youtubeUrl,
      category,
      level,
      author: req.user._id,
    });

    const createdVideo = await video.save();
    res.status(201).json(createdVideo);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar vídeo.' });
  }
};


const updateVideo = async (req, res) => {
  try {
    const { title, description, youtubeUrl, category, level } = req.body;
    const video = await Video.findById(req.params.id);

    if (video) {
      video.title = title || video.title;
      video.description = description || video.description;
      video.youtubeUrl = youtubeUrl || video.youtubeUrl;
      video.category = category || video.category;
      video.level = level || video.level;
      const updatedVideo = await video.save();
      res.status(200).json(updatedVideo);
    } else {
      res.status(404).json({ message: 'Vídeo não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar vídeo.' });
  }
};


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


const toggleFavorite = async (req, res) => {
  try {
    
    const userId = req.user._id;
    const videoId = req.params.id;

    
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado.' });
    }

   
    const user = await User.findById(userId);

   
    const isFavorited = user.favorites.includes(videoId);

    if (isFavorited) {
      
      user.favorites.pull(videoId);
      await user.save();
      res.status(200).json({ message: 'Vídeo removido dos favoritos.' });
    } else {
      
      user.favorites.push(videoId);
      await user.save();
      res.status(200).json({ message: 'Vídeo adicionado aos favoritos.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar favorito.' });
  }
};

const createVideoComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'O conteúdo do comentário é obrigatório.' });
    }

    const video = await Video.findById(req.params.id);

    if (video) {
      const comment = {
        content: content,
        author: req.user._id, 
      };

      video.comments.unshift(comment);
      await video.save();

      const populatedVideo = await Video.findById(video._id).populate('comments.author', 'name');

      res.status(201).json(populatedVideo.comments[0]);
    } else {
      res.status(404).json({ message: 'Vídeo não encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar comentário.' });
  }
};

module.exports = {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleFavorite,
  createVideoComment,
};