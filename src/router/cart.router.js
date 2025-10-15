const {Router} = require("express");

const cartControllers = require("../controllers/cart.controllers");
const {authorizeCartItemAction} = require("../middlewares/authorization.middleware")

const cartRouter = Router();


cartRouter.get("/", cartControllers.getCartByUserController);
cartRouter.post("/cartItems/", cartControllers.addCartItemToCartController);
cartRouter.put("/cartItems/:cartItemId", authorizeCartItemAction, cartControllers.updateCartItemController);
cartRouter.patch("/cartItems/:cartItemId", authorizeCartItemAction, cartControllers.updateCartItemController);
cartRouter.delete("/cartItems/:cartItemId", authorizeCartItemAction, cartControllers.deleteCartItemController);

module.exports = cartRouter;

