const {Router} = require("express");
const passport = require("passport");

const authControllers = require("../controllers/auth.controllers");
const authRouter = Router();

authRouter.post("/register", authControllers.registerController);
authRouter.post("/login", authControllers.loginController);
authRouter.post("/logout", authControllers.logoutController);
authRouter.post("/refresh", authControllers.refreshTokenController);

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