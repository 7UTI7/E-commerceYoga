const express = require('express');
const router = express.Router();
const {
  getClassSlots,
  getClassSlotById,
  createClassSlot,
  updateClassSlot,
  deleteClassSlot,
} = require('../controllers/classSlotController');

// Middleware de autenticação
const { protect, admin } = require('../middleware/authMiddleware');

// --- ROTAS PÚBLICAS ---
router.get('/', getClassSlots);
router.get('/:id', getClassSlotById);

// --- ROTAS DE ADMIN ---
router.post('/', protect, admin, createClassSlot);
router.put('/:id', protect, admin, updateClassSlot);
router.delete('/:id', protect, admin, deleteClassSlot);

module.exports = router;