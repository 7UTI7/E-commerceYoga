const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} = require('../controllers/whatsAppGroupController');

// Middleware de autenticação
const { protect, admin } = require('../middleware/authMiddleware');

// --- ROTA DE USUÁRIO LOGADO (STUDENT ou ADMIN) ---

// @desc    Qualquer usuário LOGADO pode ver a lista de grupos
// @route   GET /api/whatsapp-groups
router.get('/', protect, getGroups);


// --- ROTAS DE ADMIN ---
// @desc    Apenas ADMINS podem gerenciar os grupos

// @route   POST /api/whatsapp-groups
router.post('/', protect, admin, createGroup);

// @route   GET /api/whatsapp-groups/:id (Para o admin editar)
router.get('/:id', protect, admin, getGroupById);

// @route   PUT /api/whatsapp-groups/:id
router.put('/:id', protect, admin, updateGroup);

// @route   DELETE /api/whatsapp-groups/:id
router.delete('/:id', protect, admin, deleteGroup);

module.exports = router;