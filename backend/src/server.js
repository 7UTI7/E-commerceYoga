require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConnect');

// 1. IMPORTAMOS O NOVO ARQUIVO DE ROTAS
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');

// --- Conexão com o Banco de Dados ---
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// --- Rotas ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API está funcionando!' });
});

// 2. DIZEMOS AO EXPRESS PARA USAR AS ROTAS DE AUTENTICAÇÃO
// Qualquer requisição para '/api/auth/...' será tratada pelo 'authRoutes'
app.use('/api/auth', authRoutes);

// (Nossas outras rotas virão aqui: /api/articles, /api/classes, etc.)
// Rotas de Artigos
// Qualquer requisição para /api/articles/... será gerenciada pelo articleRoutes
app.use('/api/articles', articleRoutes);

// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`[Servidor] Rodando na porta ${PORT}`);
});