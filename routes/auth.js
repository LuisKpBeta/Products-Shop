const authRouter = require("express").Router();
const authController = require("../controllers/auth");
const User = require("../models/user");
const { check } = require("express-validator");
const signUpValidation = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(user => {
        if (user) return Promise.reject("E-mail already exists");
      });
    })
    .normalizeEmail(),
  check("password", "Password must have more than 8 characters")
    .trim()
    .isLength({ min: 5 }),
  check("confirmPassword", "Password confirmation did not match")
    .exists()
    .trim()
    .custom((value, { req }) => value === req.body.password)
];
const loginUpValidation = [
  check("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  check("password", "Password must have more than 8 characters")
    .trim()
    .isLength({ min: 5 })
];
authRouter.get("/login", authController.getLogin);
authRouter.post("/login", loginUpValidation, authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/signup", authController.getSignup);

authRouter.post("/signup", signUpValidation, authController.signup);

authRouter.get("/reset", authController.getReset);
authRouter.post("/reset", authController.reset);
authRouter.get("/reset/:token", authController.getNewPassword);
authRouter.post("/new-password", authController.updatePassword);
module.exports = authRouter;
