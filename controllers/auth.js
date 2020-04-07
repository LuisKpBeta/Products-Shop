const User = require("../models/user");
const bcrypt = require("bcryptjs");
const emailService = require("../services/mail");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
exports.getLogin = (req, res, next) => {
  let message = req.flash("message");
  message = message.length > 0 ? message[0] : null;
  let error = req.flash("error");
  error = error.length > 0 ? error[0] : null;
  const oldInput = req.flash("oldInput")[0] || "";
  const fields = req.flash("fields") || [];
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    error,
    message,
    oldInput,
    fields,
  });
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      const fields = errors.array().map((err) => {
        return err.param;
      });
      req.flash("fields", fields);
      req.flash("oldInput", email);
      req.flash("error", errors.array()[0].msg);
      return res.status(422).redirect("/login");
    }
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("fields", ["email"]);
      req.flash("error", "E-mail not exists");
      return res.redirect("/login");
    } else {
      const isCorretPassword = await bcrypt.compare(password, user.password);
      if (!isCorretPassword) {
        req.flash("fields", ["password"]);
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
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      const fields = errors.array().map((err) => {
        return err.param;
      });
      req.flash("fields", fields);
      req.flash("oldInput", { email, password });
      req.flash("error", errors.array()[0].msg);
      return res.status(422).redirect("/signup");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      cart: { items: [] },
    });
    await user.save();
    console.log(user);
    emailService.sendMail(user.email);
    return res.redirect("/login");
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.getSignup = async (req, res, next) => {
  let message = req.flash("error");
  message = message.length > 0 ? message[0] : null;
  const oldInput = req.flash("oldInput")[0] || { email: "", password: "" };
  const fields = req.flash("fields");
  console.log(fields);
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    error: message,
    oldInput,
    fields,
  });
};
exports.getReset = (req, res, next) => {
  let message = req.flash("message");
  message = message.length > 0 ? message[0] : null;
  let error = req.flash("error");
  error = error.length > 0 ? error[0] : null;
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    message,
    error,
  });
};
exports.reset = (req, res, next) => {
  try {
    const { email } = req.body;
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        return res.redirect("/reset");
      }
      const token = buffer.toString("hex");
      const user = await User.findOne({ email });
      if (!user) {
        req.flash("error", "No account with that email found");
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();
      emailService.resetPassword(user.email, user.resetToken);
      req.flash("message", "Reset Link has sent to your email");
      return res.redirect("/reset");
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.logout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
exports.getNewPassword = async (req, res, next) => {
  try {
    let error = req.flash("error");
    error = error.length > 0 ? error[0] : null;
    const token = req.params.token;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("error", "Token invalid");
      res.redirect("/login");
    } else {
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        userId: user._id,
        passwordToken: token,
        error,
      });
    }
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
exports.updatePassword = async (req, res, next) => {
  try {
    const { userId, password, passwordToken } = req.body;
    const user = await User.findOne({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("error", "Token invalid");
      res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();
    req.flash("message", "Password updated");
    res.redirect("/login");
  } catch (error) {
    const err = new Error(error);
    err.httpStatus = 500;
    next(err);
  }
};
