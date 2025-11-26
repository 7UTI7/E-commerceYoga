require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConnect');

// ARQUIVOS DE ROTAS
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const videoRoutes = require('./routes/videoRoutes');
const eventRoutes = require('./routes/eventRoutes');
const classSlotRoutes = require('./routes/classSlotRoutes');
const whatsAppGroupRoutes = require('./routes/whatsAppGroupRoutes');
const searchRoutes = require('./routes/searchRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// --- Conexão com o Banco de Dados ---
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// --- Rotas ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API está funcionando!' });
});

// Rotas de Autenticação
app.use('/api/auth', authRoutes);


// Rotas de Artigos
app.use('/api/articles', articleRoutes);

// Rotas de Vídeos
app.use('/api/videos', videoRoutes);

// Rotas de Eventos
app.use('/api/events', eventRoutes);

// Rotas de Horários de Aula
app.use('/api/class-slots', classSlotRoutes);

// Rotas de Grupos do WhatsApp
app.use('/api/whatsapp-groups', whatsAppGroupRoutes);

app.use('/api/search', searchRoutes);

app.use('/api/upload', uploadRoutes);

// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`[Servidor] Rodando na porta ${PORT}`);
});