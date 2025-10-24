const express = require('express');
const router = express.Router();

const {getPublishedArticles, getArticleBySlug, createArticle} = require('../controllers/articleController');

// Middlewares
const {protect, admin} = require('../middleware/authMiddleware');

// Rota pública para listar todos os artigos
// GET /api/articles
router.get('/', getPublishedArticles);
// Rota pública para buscar um artigo específico pelo slug
// GET /api/articles/meu-primeiro-artigo
router.get('/:slug', getArticleBySlug);

// (Aqui virão as rotas de Admin: POST /, PUT /:id, DELETE /:id)
// --- ROTAS DE ADMIN ---
router.post('/', protect, admin, createArticle);

module.exports = router;