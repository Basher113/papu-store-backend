const {Router} = require("express");
const productRouter = Router();

const passport = require("passport");

const {getProductsController, createProductsController, updateProductController, deleteProductController} = require("../controllers/product.controllers");

productRouter.get("/", getProductsController);
productRouter.post("/", passport.authenticate('jwt', { session: false }), createProductsController);
productRouter.put("/:productId", passport.authenticate('jwt', { session: false }), updateProductController);
productRouter.delete("/:productId", passport.authenticate('jwt', { session: false }), deleteProductController);

module.exports = productRouter;
