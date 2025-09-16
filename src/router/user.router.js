const {Router} = require("express");
const userRouter = Router();

const {getUsersController, getCurrentUserDataController} = require("../controllers/user.controller");
const passport = require("passport");

userRouter.get("/", getUsersController);
userRouter.get("/profile", passport.authenticate('jwt', { session: false }), getCurrentUserDataController);

module.exports = userRouter;