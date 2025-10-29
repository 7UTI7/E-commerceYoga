const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

// Middleware de autenticação e autorização
const { protect, admin } = require('../middleware/authMiddleware');

// --- ROTAS PÚBLICAS ---
router.get('/', getEvents);
router.get('/:id', getEventById);

// --- ROTAS DE ADMIN ---
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;