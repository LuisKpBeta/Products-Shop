require("dotenv").config();
const nodemailer = require("nodemailer");
let transporter;
const initMailServer = () => {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASS // generated ethereal password
    }
  });
};
const sendMail = async email => {
  let info = await transporter.sendMail({
    from: "shop_products@sendmail.com", // sender address
    to: email, // list of receivers
    subject: "Wellcome", // Subject line
    html: "<b>Enjoy our website?</b>" // html body
  });
  console.log("Message sent: %s", info.messageId);
};
const resetPassword = async (email, token) => {
  let info = await transporter.sendMail({
    from: "shop_products@sendmail.com", // sender address
    to: email, // list of receivers
    subject: "Reset Password", // Subject line
    html: `
      <p>You request a password reset</p>
      <p>Click this link to set a new password</p>  
      <a href="http://localhost:3000/reset/${token}">RESET PASSWORD</a>
    ` // html body
  });
  console.log("Message sent: %s", info.messageId);
};
module.exports = {
  initMailServer,
  sendMail,
  resetPassword
};
