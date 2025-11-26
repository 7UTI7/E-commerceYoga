const User = require('../models/userModel');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { verifyEmailTemplate, forgotPasswordTemplate } = require('../utils/emailTemplates');
const jwt = require('jsonwebtoken');

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    const htmlMessage = verifyEmailTemplate(user.name, verifyUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Bem-vindo! Confirme seu e-mail - Yoga App',
        html: htmlMessage,
      });
      res.status(200).json({
        success: true,
        message: 'Cadastro realizado! Por favor, verifique seu e-mail para ativar a conta.',
      });
    } catch (error) {
      await user.deleteOne();
      return res.status(500).json({ message: 'O e-mail não pôde ser enviado. Tente novamente.' });
    }

  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message)[0];
      return res.status(400).json({ message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Este e-mail já está em uso.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// @desc    Verificar E-mail
// @route   GET /api/auth/verifyemail/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou inexistente.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      message: 'E-mail verificado com sucesso! Você está logado.',
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao verificar e-mail.' });
  }
};

// @desc    Esqueci a senha
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Não há usuário com este e-mail.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const htmlMessage = forgotPasswordTemplate(resetUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Redefinição de Senha - Yoga App',
        html: htmlMessage,
      });

      res.status(200).json({ success: true, data: 'E-mail de recuperação enviado!' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'O e-mail não pôde ser enviado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// @desc    Redefinir Senha
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Senha atualizada com sucesso! Faça login com a nova senha.',
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
};

// @desc    Login
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha e-mail e senha.' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Por favor, verifique seu e-mail antes de fazer login.' });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar, // <--- CORREÇÃO: Retornando o avatar no login
      token: token,
      message: 'Login realizado com sucesso!'
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// @desc    Buscar os dados do usuário logado
// @route   GET /api/auth/me
// @access  Private (Qualquer usuário logado)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar, // <--- CORREÇÃO: Retornando o avatar no GetMe (Refresh)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// @desc    Atualizar dados do usuário logado
// @route   PUT /api/auth/me
// @access  Private (Qualquer usuário logado)
const updateMe = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Este e-mail já está em uso.' });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar, // Retorna a foto atualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// @desc    Atualizar a senha do usuário logado
// @route   PUT /api/auth/updatepassword
// @access  Private (Qualquer usuário logado)
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Por favor, forneça a senha antiga e a nova senha.' });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha antiga incorreta.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Senha atualizada com sucesso.' });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// @desc    Buscar os vídeos favoritos
// @route   GET /api/auth/me/favorites
// @access  Private (Qualquer usuário logado)
const getMyFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar favoritos.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  updatePassword,
  getMyFavorites,
  verifyEmail,
  forgotPassword,
  resetPassword,
};