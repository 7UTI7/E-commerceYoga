const express = require('express');
const router = express.Router();

// Importamos o nosso controlador
const { registerUser, loginUser } = require('../controllers/authController');

// Quando uma requisição POST chegar em '/register',
// ela será gerenciada pela função 'registerUser'
router.post('/register', registerUser);

// Rota de Login
router.post('/login', loginUser);

module.exports = router;