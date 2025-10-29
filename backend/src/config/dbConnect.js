const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`[Database] MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Erro ao conectar ao MongoDB: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;