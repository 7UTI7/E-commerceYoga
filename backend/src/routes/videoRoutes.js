const express = require('express');
const router = express.Router();
const {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleFavorite,
} = require('../controllers/videoController');

// Middleware de autenticação e autorização
const { protect, admin } = require('../middleware/authMiddleware');

// --- ROTAS PÚBLICAS ---
router.get('/', getVideos);
router.get('/:id', getVideoById);

// NOVO: Rota de Favoritar protegida
router.post('/:id/favorite', protect, toggleFavorite);

// --- ROTAS DE ADMIN ---
router.post('/', protect, admin, createVideo);
router.put('/:id', protect, admin, updateVideo);
router.delete('/:id', protect, admin, deleteVideo);

module.exports = router;