const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  
  if (process.env.SMTP_PASSWORD) {
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL, 
        pass: process.env.SMTP_PASSWORD, 
      },
    });
  } else {
  
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


  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`, // 
    to: options.email,
    subject: options.subject,
    html: options.html, 
    text: options.message,
  };

  const info = await transporter.sendMail(message);

  console.log('Mensagem enviada: %s', info.messageId);

  
  if (!process.env.SMTP_PASSWORD) {
    console.log('Visualizar E-mail (Preview URL): %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;