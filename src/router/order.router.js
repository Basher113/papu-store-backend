const {Router} = require("express");
const orderRouter = Router();

const orderController = require("../controllers/order.controller");
const paymentController = require("../controllers/payment.controller")
const validationMiddlewares = require("../middlewares/validation.middleware");

const {authorizeOrderAction} = require("../middlewares/authorization.middleware");
const {orderStatusSchema} = require("../validations/order.schema");


orderRouter.get("/", orderController.getUserOrdersController);
orderRouter.post("/", orderController.createOrderController);

orderRouter.post("/paymongoCheckout", paymentController.createPaymongoCheckoutSessionAndOrder); // route when paying online *paymongo (Gcash, Bank)
orderRouter.post("/paymongo_webhook", paymentController.handlePaymongoWebhook); // handles webhook after user successful checkout (!create order, and payment transaction)
orderRouter.get("/:orderId", orderController.getUserOrderByOrderIdController);
orderRouter.get("/session/:sessionId", orderController.getUserOrderBySessionIdController); // After checkout session
orderRouter.put("/:orderId", validationMiddlewares.validateBody(orderStatusSchema), authorizeOrderAction, orderController.updatelOrderContoller);
orderRouter.patch("/:orderId", validationMiddlewares.validateBody(orderStatusSchema), authorizeOrderAction, orderController.updatelOrderContoller);

orderRouter.get("/orderItems/",orderController.getUserOrderItemsController);

module.exports = orderRouter;
