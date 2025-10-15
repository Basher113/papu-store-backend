const {Router} = require("express");
const orderRouter = Router();

const orderController = require("../controllers/order.controller");
const validationMiddlewares = require("../middlewares/validation.middleware");

const {authorizeOrderAction} = require("../middlewares/authorization.middleware");
const {orderStatusSchema} = require("../validations/order.schema");


orderRouter.get("/", orderController.getUserOrdersController);
orderRouter.post("/", orderController.createOrderController);

orderRouter.get("/:orderId", orderController.getUserOrderController);
orderRouter.put("/:orderId", validationMiddlewares.validateBody(orderStatusSchema), authorizeOrderAction, orderController.updatelOrderContoller);
orderRouter.patch("/:orderId", validationMiddlewares.validateBody(orderStatusSchema), authorizeOrderAction, orderController.updatelOrderContoller);

orderRouter.get("/orderItems/",orderController.getUserOrderItemsController);

module.exports = orderRouter;
