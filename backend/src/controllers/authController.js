const User = require('../models/userModel');

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

    if (user) {
      const token = user.getSignedJwtToken();
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
        message: 'Usuário registrado com sucesso!'
      });
    } else {
      res.status(400).json({ message: 'Dados inválidos.' });
    }

  } catch (error) {
    // Verifica se foi um erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      // Pega a primeira mensagem de erro (ex: a da senha)
      const message = Object.values(error.errors).map(val => val.message)[0];
      return res.status(400).json({ message: message });
    }
    
    // Verifica se foi um erro de chave duplicada (e-mail já existe)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Este e-mail já está em uso.' });
    }

    // Log original para erros inesperados
    console.error('[REGISTER_USER_ERROR]', error);
    // Resposta genérica 500 para outros erros
    res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });
  }
};

// Função de Login
// @desc    Autenticar (logar) um usuário
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    console.log('\n--- [NOVA TENTATIVA DE LOGIN] ---'); // Log 1: Começo
    const { email, password } = req.body;

    // Log 2: O que recebemos do Postman?
    console.log('Dados recebidos do Postman:', { email, password });

    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, preencha e-mail e senha.' });
    }

    // Log 3: Vamos ver o que o banco de dados encontra
    const user = await User.findOne({ email }).select('+password');

    // Log 4: O usuário foi encontrado?
    if (!user) {
      console.log('Resultado da Busca: Usuário NÃO encontrado com esse e-mail.');
      console.log('--- [LOGIN FALHOU] ---');
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    // Log 5: Se chegamos aqui, o usuário FOI encontrado
    console.log('Resultado da Busca: Usuário encontrado:', user.email);
    console.log('Senha (criptografada) vinda do banco:', user.password); // Isso prova que o .select('+password') funcionou

    // Log 6: Vamos testar a senha
    const isMatch = await user.matchPassword(password);
    console.log('Resultado da Comparação de Senha (isMatch):', isMatch); // Esta é a linha mais importante!

    if (!isMatch) {
      console.log('A senha digitada NÃO bateu com a senha do banco.');
      console.log('--- [LOGIN FALHOU] ---');
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    // Log 7: Se chegamos aqui, deu tudo certo
    console.log('Sucesso! Senha bateu. Gerando token...');
    console.log('--- [LOGIN SUCESSO] ---');

    const token = user.getSignedJwtToken();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
      message: 'Login realizado com sucesso!'
    });

  } catch (error) {
    console.error('[LOGIN_USER_ERROR]', error);
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
    const { name, email } = req.body;

    // Pega o usuário do banco (o 'req.user' do token)
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Lógica de mudança de e-mail
    // Se o e-mail mudou, precisamos verificar se o novo já existe
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Este e-mail já está em uso por outra conta.' });
      }
      user.email = email;
    }

    // Lógica de mudança de nome
    if (name) {
      user.name = name;
    }

    // Salva as alterações
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
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

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  updatePassword
};