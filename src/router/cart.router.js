const {Router} = require("express");
const cartControllers = require("../controllers/cart.controllers");
const passport = require("passport")
const cartRouter = Router();

cartRouter.get("/", passport.authenticate('jwt', { session: false }), cartControllers.getCartByUserController);

module.exports = cartRouter

