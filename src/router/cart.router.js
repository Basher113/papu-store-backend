const {Router} = require("express");
const cartControllers = require("../controllers/cart.controllers");
const passport = require("passport");
const cartRouter = Router();

cartRouter.get("/", passport.authenticate('jwt', { session: false }), cartControllers.getCartByUserController);
cartRouter.post("/cartItems/", passport.authenticate('jwt', { session: false }), cartControllers.addCartItemToCartController);
cartRouter.put("/cartItems/:cartItemId", passport.authenticate('jwt', { session: false }), cartControllers.updateCartItemController);
cartRouter.patch("/cartItems/:cartItemId", passport.authenticate('jwt', { session: false }), cartControllers.updateCartItemController);
cartRouter.delete("/cartItems/:cartItemId", passport.authenticate('jwt', { session: false }), cartControllers.deleteCartItemController);

module.exports = cartRouter;

