const nodemailer = require('nodemailer');

const sendEmail = async (options) => {

  const testAccount = await nodemailer.createTestAccount();

 
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, 
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass, 
    },
  });


  const message = {
    from: '"Yoga App 🧘‍♀️" <noreply@yogaapp.com>',
    to: options.email,
    subject: options.subject,
    
    html: options.html, 
    text: options.message, 
  };

  
  const info = await transporter.sendMail(message);

  console.log('Mensagem enviada: %s', info.messageId);
  

  console.log('Visualizar E-mail (Preview URL): %s', nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;