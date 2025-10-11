const {Router} = require("express");
const passport = require("passport");

const cartControllers = require("../controllers/cart.controllers");
const {authorizeCartItemAction} = require("../middlewares/authorization.middleware")

const cartRouter = Router();


cartRouter.get("/", passport.authenticate('jwt', { session: false }), cartControllers.getCartByUserController);
cartRouter.post("/cartItems/", passport.authenticate('jwt', { session: false }), cartControllers.addCartItemToCartController);
cartRouter.put("/cartItems/:cartItemId", passport.authenticate('jwt', { session: false }), authorizeCartItemAction, cartControllers.updateCartItemController);
cartRouter.patch("/cartItems/:cartItemId", passport.authenticate('jwt', { session: false }), authorizeCartItemAction, cartControllers.updateCartItemController);
cartRouter.delete("/cartItems/:cartItemId", passport.authenticate('jwt', { session: false }), authorizeCartItemAction, cartControllers.deleteCartItemController);

module.exports = cartRouter;

