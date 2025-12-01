const User = require('../models/userModel');
const Article = require('../models/articleModel');
const Video = require('../models/videoModel');
const ClassSlot = require('../models/classSlotModel');

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalArticles = await Article.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalClasses = await ClassSlot.countDocuments();

    const usersByMonth = await User.aggregate([
      {
        $match: { role: 'STUDENT' }
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, 
      { $limit: 6 } 
    ]);

    
    const recentArticles = await Article.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt status');

   
    res.status(200).json({
      counts: {
        students: totalStudents,
        content: totalArticles + totalVideos,
        classes: totalClasses
      },
      charts: {
        usersByMonth 
      },
      recentActivity: {
        articles: recentArticles
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas do dashboard.' });
  }
};

module.exports = { getDashboardStats };