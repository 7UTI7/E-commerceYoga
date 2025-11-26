// Template genérico para manter o estilo consistente
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }
    .header h1 {
      color: #6a1b9a; /* Cor roxa (tema Yoga) */
      margin: 0;
    }
    .content {
      padding: 30px 0;
      color: #333333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #6a1b9a;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888888;
      margin-top: 30px;
      border-top: 1px solid #f0f0f0;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Yoga App 🧘‍♀️</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Se você não solicitou este e-mail, por favor ignore-o.</p>
      <p>&copy; ${new Date().getFullYear()} Plataforma de Yoga da Prof. Karla</p>
    </div>
  </div>
</body>
</html>
`;

// Template de Verificação de E-mail
const verifyEmailTemplate = (name, url) => {
  const content = `
    <h2>Bem-vindo(a), ${name}!</h2>
    <p>Obrigado por se cadastrar na nossa plataforma. Para começar a agendar suas aulas e ver os conteúdos exclusivos, precisamos que você confirme seu endereço de e-mail.</p>
    <div style="text-align: center;">
      <a href="${url}" class="button">Confirmar Meu E-mail</a>
    </div>
    <p>Ou cole este link no seu navegador: <br> <small>${url}</small></p>
  `;
  return baseTemplate(content);
};

// Template de Recuperação de Senha
const forgotPasswordTemplate = (url) => {
  const content = `
    <h2>Recuperação de Senha</h2>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se foi você, clique no botão abaixo para criar uma nova senha.</p>
    <div style="text-align: center;">
      <a href="${url}" class="button">Redefinir Minha Senha</a>
    </div>
    <p>Este link expira em 10 minutos.</p>
    <p>Ou cole este link no seu navegador: <br> <small>${url}</small></p>
  `;
  return baseTemplate(content);
};

module.exports = { verifyEmailTemplate, forgotPasswordTemplate };