const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // VERIFICAÇÃO: Se temos as credenciais de produção (SendGrid) no .env
  if (process.env.SMTP_PASSWORD) {
    // Configuração de PRODUÇÃO (SendGrid)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL, // Sempre 'apikey' para SendGrid
        pass: process.env.SMTP_PASSWORD, // A chave SG....
      },
    });
  } else {
    // Configuração de DESENVOLVIMENTO (Ethereal)
    // Só cria conta de teste se não tivermos SendGrid configurado
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Configurar a mensagem
  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`, // Nome e E-mail do .env
    to: options.email,
    subject: options.subject,
    html: options.html, 
    text: options.message,
  };

  const info = await transporter.sendMail(message);

  console.log('Mensagem enviada: %s', info.messageId);

  // Se estivermos usando Ethereal, mostramos o link de preview
  if (!process.env.SMTP_PASSWORD) {
    console.log('Visualizar E-mail (Preview URL): %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;