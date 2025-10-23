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
      password, // Só passamos a senha normal. O 'pre-save' cuida de criptografar
    });

    // Se o usuário foi criado com sucesso
    if (user) {
   
      // Geramos um token REAL usando o método que criamos no modelo
      const token = user.getSignedJwtToken();

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token, // Agora enviamos o token real!
        message: 'Usuário registrado com sucesso!'
      });
    } else {
      res.status(400).json({ message: 'Dados inválidos.' });
    }

  } catch (error) {
    console.error('[REGISTER_USER_ERROR]', error);
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

module.exports = {
  registerUser,
  loginUser
};