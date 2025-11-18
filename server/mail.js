const nodemailer = require("nodemailer");

// ⚠️ ЭТО НАДО ЗАПОЛНИТЬ СВОИМИ ДАННЫМИ SMTP
// для тестов можно использовать mailtrap.io или свой почтовик
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: "your_email@example.com",
    pass: "your_password",
  },
});

async function sendVerificationEmail(to, code) {
  const mailOptions = {
    from: '"Discord Clone" <no-reply@discordclone.local>',
    to,
    subject: "Код подтверждения регистрации",
    text: `Ваш код подтверждения: ${code}`,
    html: `<p>Ваш код подтверждения: <b>${code}</b></p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
