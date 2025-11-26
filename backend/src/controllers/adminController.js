const User = require('../models/userModel');
const Article = require('../models/articleModel');
const Video = require('../models/videoModel');
const ClassSlot = require('../models/classSlotModel');

// @desc    Obter estatísticas para o Dashboard
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // 1. Contagens Totais (Cards do topo)
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalArticles = await Article.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalClasses = await ClassSlot.countDocuments();

    // 2. Dados para Gráfico: Novos Usuários por Mês (Últimos 6 meses)
    // (Isso usa o Aggregation Pipeline do MongoDB)
    const usersByMonth = await User.aggregate([
      {
        $match: { role: 'STUDENT' } // Só alunos
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
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Ordena cronologicamente
      { $limit: 6 } // Pega os últimos 6 meses
    ]);

    // 3. Conteúdo Recente (Tabela de atividades)
    const recentArticles = await Article.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt status');

    // Retorna tudo num pacotão JSON
    res.status(200).json({
      counts: {
        students: totalStudents,
        content: totalArticles + totalVideos,
        classes: totalClasses
      },
      charts: {
        usersByMonth // O frontend usa isso para o Gráfico de Barras/Linha
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