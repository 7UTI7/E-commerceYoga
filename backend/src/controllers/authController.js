const User = require('../models/userModel');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { verifyEmailTemplate, forgotPasswordTemplate } = require('../utils/emailTemplates');

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

    // Cria o usuário (mas isVerified ainda é false por padrão)
    const user = await User.create({
      name,
      email,
      password,
    });

    // 3. LÓGICA DE VERIFICAÇÃO DE E-MAIL
    // Gera o token de verificação (usando o método do Model)
    const verificationToken = user.getVerificationToken();

    // Salva o token no banco
    await user.save({ validateBeforeSave: false });

    // Cria a URL que será enviada no e-mail
    // (Aponta para uma rota do backend que vamos criar no próximo passo)
    // Define a URL do Frontend (Local ou Produção)
    // Se tiver uma variável de ambiente (no Render), usa ela. Se não, usa o localhost:5173
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Cria o link apontando para a rota do React
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
      // Se o e-mail falhar, deletamos o usuário para ele tentar de novo
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

// @desc    Verificar E-mail (Link clicado pelo usuário)
// @route   GET /api/auth/verifyemail/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    // Pega o token da URL e faz o hash (para comparar com o banco)
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Busca o usuário com esse token
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou inexistente.' });
    }

    // Ativa a conta
    user.isVerified = true;
    user.verificationToken = undefined; // Limpa o token
    await user.save();

    // Retorna o Token de Login (agora ele está logado!)
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

// @desc    Esqueci a senha (Envia e-mail com token)
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Não há usuário com este e-mail.' });
    }

    // 1. Gera o token de reset (usando o método do userModel)
    const resetToken = user.getResetPasswordToken();

    // 2. Salva o token no banco (sem validar outros campos)
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const htmlMessage = forgotPasswordTemplate(resetUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Redefinição de Senha - Yoga App',
        html: htmlMessage, // Mudamos de 'message' para 'html'
      });

      res.status(200).json({ success: true, data: 'E-mail de recuperação enviado!' });
    } catch (error) {
      // Se o e-mail falhar, limpa o token do banco para não travar o usuário
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

// @desc    Redefinir Senha (Nova senha via Token)
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // 1. O token vem na URL. Precisamos fazer o Hash dele para comparar com o banco
    // (Pois no banco salvamos apenas o hash por segurança)
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // 2. Busca usuário que tenha esse token E que não esteja expirado
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // $gt = maior que agora
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    // 3. Define a nova senha (o pre-save vai criptografar)
    user.password = req.body.password;

    // 4. Limpa os campos de token (já usou, não serve mais)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // 5. Retorna sucesso (Frontend redireciona para login)
    res.status(200).json({
      success: true,
      message: 'Senha atualizada com sucesso! Faça login com a nova senha.',
    });

  } catch (error) {
    // Se a senha for fraca, o erro de validação cai aqui
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

    // 4. NOVA TRAVA DE SEGURANÇA
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Por favor, verifique seu e-mail antes de fazer login.' });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
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
    // Buscamos o usuário completo no banco
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// @desc    Atualizar dados do usuário logado (nome, email)
// @route   PUT /api/auth/me
// @access  Private (Qualquer usuário logado)
const updateMe = async (req, res) => {
  try {
    // 1. ADICIONE 'avatar' AQUI NA DESESTRUTURAÇÃO
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

    // 2. ADICIONE ESTE BLOCO PARA SALVAR A FOTO
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

    // 1. Pega o usuário logado (e sua senha) do banco
    const user = await User.findById(req.user._id).select('+password');

    // 2. Verifica se a senha antiga (oldPassword) está correta
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha antiga incorreta.' });
    }

    // 3. Se estiver correta, define a nova senha
    user.password = newPassword;

    // 4. Salva o usuário
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

// NOVO: Função de Listar Favoritos
// @desc    Buscar os vídeos favoritos do usuário logado
// @route   GET /api/auth/me/favorites
// @access  Private (Qualquer usuário logado)
const getMyFavorites = async (req, res) => {
  try {
    // 1. Busca o usuário E usa .populate()
    // .populate('favorites') diz ao Mongoose: "pegue os IDs no array 'favorites'
    // e substitua-os pelos documentos de vídeo completos"
    const user = await User.findById(req.user._id).populate('favorites');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 2. Retorna apenas a lista de vídeos populados
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