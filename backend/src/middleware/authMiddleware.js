const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware 1: "protect" - Protege a rota e identifica o usuário
const protect = async (req, res, next) => {
  let token;

  // O token JWT é enviado no Header 'Authorization' no formato 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Pega o token do header (tira o 'Bearer ' do começo)
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifica se o token é válido usando nosso segredo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Busca o usuário do token no banco de dados
      //    e anexa o usuário ao objeto 'req' para que
      //    os próximos controladores possam usá-lo.
      //    Usamos '-password' para garantir que a senha não venha.
      req.user = await User.findById(decoded.id).select('-password');

      // 4. Deixa a requisição continuar
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, sem token.' });
  }
};

// Middleware 2: "admin" - Verifica se o usuário (identificado pelo 'protect') é Admin
const admin = (req, res, next) => {
  // Este middleware DEVE rodar DEPOIS do 'protect'
  if (req.user && req.user.role === 'ADMIN') {
    // Se o usuário existe E tem a role 'ADMIN', deixa passar
    next();
  } else {
    // Se não for admin, bloqueia
    res.status(403).json({ message: 'Não autorizado. Acesso restrito a administradores.' });
  }
};

module.exports = { protect, admin };