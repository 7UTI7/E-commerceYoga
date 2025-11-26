const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Rota Protegida (Só Admin pode ver os gráficos)
router.get('/dashboard', protect, admin, getDashboardStats);

module.exports = router;