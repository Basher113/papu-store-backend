const {Router} = require("express");
const passport = require("passport");

const authControllers = require("../controllers/auth.controllers");
const validationMiddlewares = require("../middlewares/validation.middleware");
const authSchema = require("../validations/auth.schema");
const authRouter = Router();

authRouter.post("/register", validationMiddlewares.validateBody(authSchema.register), authControllers.registerController);
authRouter.post("/login", validationMiddlewares.validateBody(authSchema.login), authControllers.loginController);
authRouter.post("/logout", authControllers.logoutController);
authRouter.post("/refreshToken", authControllers.refreshTokenController);

// google oauth
authRouter.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    session: false,
  }),
  authControllers.googleCallbackController
);

module.exports = authRouter;