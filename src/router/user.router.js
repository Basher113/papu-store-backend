const {Router} = require("express");
const userRouter = Router();

const userController = require("../controllers/user.controller");
const passport = require("passport");

userRouter.get("/", userController.getUsersController);
userRouter.get("/profile", passport.authenticate('jwt', { session: false }), userController.getCurrentUserDataController);

module.exports = userRouter;