const {Router} = require("express");
const authControllers = require("../controllers/auth.controllers")
const authRouter = Router();

authRouter.post("/register", authControllers.registerController);
authRouter.post("/login", authControllers.loginController);
authRouter.post("/logout", authControllers.logoutController);
authRouter.post("/refresh", authControllers.refreshTokenController);

module.exports = authRouter;