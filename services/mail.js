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
module.exports = {
  initMailServer,
  sendMail
};
