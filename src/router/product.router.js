const {Router} = require("express");
const productRouter = Router();

const passport = require("passport");

const productControllers = require("../controllers/product.controllers");
const validationMiddlewares = require("../middlewares/validation.middleware");
const {productSchema, updateProductSchema} = require("../validations/product.schema");

productRouter.get("/", productControllers.getProductsController);
productRouter.get("/:productId", productControllers.getProductController);
productRouter.post("/", passport.authenticate('jwt', { session: false }), validationMiddlewares.validateBody(productSchema), productControllers.createProductsController);
productRouter.put("/:productId", passport.authenticate('jwt', { session: false }), validationMiddlewares.validateBody(updateProductSchema), productControllers.updateProductController);
productRouter.delete("/:productId", passport.authenticate('jwt', { session: false }), productControllers.deleteProductController);

productRouter.get("/category/:categoryName", productControllers.getProductsInCategoryController);

module.exports = productRouter;
