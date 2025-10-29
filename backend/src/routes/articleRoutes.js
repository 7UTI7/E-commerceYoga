const express = require('express');
const router = express.Router();

const {getPublishedArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle} = require('../controllers/articleController');

// Middlewares
const {protect, admin} = require('../middleware/authMiddleware');

// --- ROTAS PÚBLICAS ---
router.get('/', getPublishedArticles);
router.get('/:slug', getArticleBySlug);

// --- ROTAS DE ADMIN ---

// Criar (POST)
router.post('/', protect, admin, createArticle);

// Atualizar (PUT) 
router.put('/:id', protect, admin, updateArticle);

// Deletar (DELETE) 
router.delete('/:id', protect, admin, deleteArticle);

module.exports = router;