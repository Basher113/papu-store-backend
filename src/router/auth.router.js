const {Router} = require("express");
const authControllers = require("../controllers/auth.controllers")
const authRouter = Router();

authRouter.post("/register", authControllers.registerController);
authRouter.post("/login", authControllers.loginController);
authRouter.post("/logout", authControllers.logoutController);

module.exports = authRouter;