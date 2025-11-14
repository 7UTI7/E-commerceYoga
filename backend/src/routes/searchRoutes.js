const express = require('express');
const router = express.Router();
const { searchContent } = require('../controllers/searchController');

// Rota pública para a busca
// GET /api/search?q=yoga
router.get('/', searchContent);

module.exports = router;