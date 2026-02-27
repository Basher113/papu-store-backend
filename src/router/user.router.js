const {Router} = require("express");
const userRouter = Router();

const userController = require("../controllers/user.controller");
const passport = require("passport");

// Protected endpoint - requires authentication and ADMIN role
userRouter.get("/", passport.authenticate('jwt', { session: false }), userController.getUsersController);
userRouter.get("/profile", passport.authenticate('jwt', { session: false }), userController.getCurrentUserDataController);

module.exports = userRouter;