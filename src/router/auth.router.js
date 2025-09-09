const {Router} = require("express");
const authControllers = require("../controllers/auth.controllers")
const authRouter = Router();

authRouter.post("/register", authControllers.registerController);

module.exports = authRouter;