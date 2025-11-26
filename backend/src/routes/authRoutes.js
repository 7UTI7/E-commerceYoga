const express = require('express');
const router = express.Router();

// Importando controladores
const { 
  registerUser, 
  loginUser, 
  getMe,        
  updateMe,
  updatePassword,
  getMyFavorites,
  verifyEmail
} = require('../controllers/authController');

// Rota de Registro
router.post('/register', registerUser);

const { protect } = require('../middleware/authMiddleware');

// Rota de Login
router.post('/login', loginUser);

// Rotas de "Meu Perfil"
// Qualquer usuário logado (protect) pode acessar
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/updatepassword', protect, updatePassword);
router.get('/me/favorites', protect, getMyFavorites);

// Rota para o link do e-mail (GET)
router.get('/verifyemail/:token', verifyEmail);

module.exports = router;