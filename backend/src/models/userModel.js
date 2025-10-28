const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Definimos o "Schema" (a estrutura) do nosso Usuário
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome é obrigatório.'],
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório.'],
      unique: true, // Garante que não teremos dois e-mails iguais
      lowercase: true, // Salva sempre em minúsculas
    },
    password: {
      type: String,
      required: [true, 'A senha é obrigatória.'],
      select: false,
      // NOVO: Regra de validação (Regex)
      // Mínimo 8 caracteres, 1 minúscula, 1 maiúscula, 1 número
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/,
        'A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.',
      ],
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN'], // Só pode ser um desses dois valores
      default: 'STUDENT', // O padrão é sempre ser 'STUDENT'
    },
  },
  {
    // Adiciona campos 'createdAt' e 'updatedAt' automaticamente
    timestamps: true,
  }
);

// Hook (gancho) do Mongoose que roda ANTES de salvar o 'User'
// Vamos usar 'function' normal para ter acesso ao 'this'
userSchema.pre('save', async function (next) {
  // Só criptografa a senha se ela foi modificada (ex: no registro)
  if (!this.isModified('password')) {
    next();
  }

  // Gera o "salt" (tempero) para a criptografia
  const salt = await bcrypt.genSalt(10);
  // Criptografa a senha (this.password) e a substitui
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para gerar o Token JWT
// (Será chamado em 'authController.js')
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role }, // O que salvamos dentro do token
    process.env.JWT_SECRET, // Nosso segredo do .env
    { expiresIn: '30d' } // Expira em 30 dias
  );
};

// Método para comparar a senha digitada com a senha no banco
userSchema.methods.matchPassword = async function (enteredPassword) {
  // 'this.password' é a senha criptografada do usuário no banco
  // 'enteredPassword' é a senha que o usuário digitou no login
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exporta o modelo
// O Mongoose vai criar uma coleção chamada 'users' (no plural) no MongoDB
const User = mongoose.model('User', userSchema);

module.exports = User;