const authRouter = require("express").Router();
const authController = require("../controllers/auth");
authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.signup);
module.exports = authRouter;
