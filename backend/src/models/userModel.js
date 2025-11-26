const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
      unique: true, 
      lowercase: true, 
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor, insira um endereço de e-mail válido.',
      ],
    },
    password: {
      type: String,
      required: [true, 'A senha é obrigatória.'],
      select: false,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/,
        'A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.',
      ],
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN'], 
      default: 'STUDENT', 
    },
    isVerified: {
      type: Boolean,
      default: false, 
    },
    // --- AQUI ESTAVA FALTANDO ---
    verificationToken: String, 
    // ---------------------------
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video', 
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hook (gancho) do Mongoose que roda ANTES de salvar o 'User'
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para gerar o Token JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' } 
  );
};

// Método para comparar a senha
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para gerar token de Verificação de E-mail
userSchema.methods.getVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return verificationToken;
};

// Método para gerar token de Reset de Senha
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;