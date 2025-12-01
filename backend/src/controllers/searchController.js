const Article = require('../models/articleModel');
const Video = require('../models/videoModel');


const searchContent = async (req, res) => {
  try {

    const searchTerm = req.query.q;

    if (!searchTerm) {
      return res.status(200).json({ articles: [], videos: [] });
    }

    const regex = new RegExp(searchTerm, 'i');

    const articles = await Article.find({
      status: 'PUBLISHED',
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
      ],
    }).select('title slug createdAt'); 

    
    const videos = await Video.find({
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
      ],
    }).select('title category level youtubeUrl'); 

    
    res.status(200).json({ articles, videos });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao realizar a busca.' });
  }
};

module.exports = {
  searchContent,
};