const User = require("../models/user");
const bcrypt = require("bcryptjs");
const emailService = require("../services/mail");
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  message = message.length > 0 ? message[0] : null;
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    error: message
  });
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "E-mail not exists");
      return res.redirect("/login");
    } else {
      const isCorretPassword = await bcrypt.compare(password, user.password);
      if (!isCorretPassword) {
        req.flash("error", "Invalid Password");
        return res.redirect("/login");
      }
      req.session.user = { _id: user._id, email: user.email };
      req.session.isLogged = true;
      req.session.save(() => {
        res.redirect("/");
      });
    }
  } catch (error) {
    console.log(error);
  }
};
exports.logout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
exports.signup = async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      req.flash("error", "E-mail already exists");
      return res.redirect("/signup");
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
        cart: { items: [] }
      });
      await user.save();
      emailService.sendMail(user.email);
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};
exports.getSignup = async (req, res, next) => {
  let message = req.flash("error");
  message = message.length > 0 ? message[0] : null;
  res.render("auth/signup", {
    path: "/login",
    pageTitle: "Login",
    error: message
  });
};
