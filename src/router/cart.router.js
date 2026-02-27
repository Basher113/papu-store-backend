const {Router} = require("express");

const cartControllers = require("../controllers/cart.controllers");
const {authorizeCartItemAction} = require("../middlewares/authorization.middleware");
const validationMiddlewares = require("../middlewares/validation.middleware");
const {addCartItemSchema, updateCartItemSchema} = require("../validations/cart.schema");
const {cartLimiter} = require("../middlewares/rateLimiter.middleware");

const cartRouter = Router();


cartRouter.get("/", cartControllers.getCartByUserController);
cartRouter.post("/cartItems/", cartLimiter, validationMiddlewares.validateBody(addCartItemSchema), cartControllers.addCartItemToCartController);
cartRouter.put("/cartItems/:cartItemId", cartLimiter, authorizeCartItemAction, validationMiddlewares.validateBody(updateCartItemSchema), cartControllers.updateCartItemController);
cartRouter.patch("/cartItems/:cartItemId", cartLimiter, authorizeCartItemAction, validationMiddlewares.validateBody(updateCartItemSchema), cartControllers.updateCartItemController);
cartRouter.delete("/cartItems/:cartItemId", authorizeCartItemAction, cartControllers.deleteCartItemController);

module.exports = cartRouter;

