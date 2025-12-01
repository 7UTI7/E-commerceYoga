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
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API está funcionando!' });
});

app.use('/api/auth', authRoutes);

app.use('/api/articles', articleRoutes);

app.use('/api/videos', videoRoutes);

app.use('/api/events', eventRoutes);

app.use('/api/class-slots', classSlotRoutes);

app.use('/api/whatsapp-groups', whatsAppGroupRoutes);

app.use('/api/search', searchRoutes);

app.use('/api/upload', uploadRoutes);

app.use('/api/admin', adminRoutes);


const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`[Servidor] Rodando na porta ${PORT}`);
});