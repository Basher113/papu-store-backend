const {Router} = require("express");
const orderRouter = Router();

const orderController = require("../controllers/order.controller");
const paymentController = require("../controllers/payment.controller")
const validationMiddlewares = require("../middlewares/validation.middleware");

const {authorizeOrderAction} = require("../middlewares/authorization.middleware");
const {orderStatusSchema, createOrderSchema} = require("../validations/order.schema");

// Schema for updating order status
const updateOrderStatusSchema = {
  safeParse: (data) => {
    return orderStatusSchema.safeParse(data.newStatus);
  }
};

// IMPORTANT: Specific routes must come BEFORE parameterized routes
orderRouter.get("/", orderController.getUserOrdersController);
orderRouter.post("/", validationMiddlewares.validateBody(createOrderSchema), orderController.createOrderController);
orderRouter.get("/orderItems/", orderController.getUserOrderItemsController);
orderRouter.post("/paymongoCheckout", paymentController.createPaymongoCheckoutSessionAndOrder); // route when paying online *paymongo (Gcash, Bank)
orderRouter.post("/paymongo_webhook", paymentController.handlePaymongoWebhook); // handles webhook after user successful checkout (!create order, and payment transaction)
orderRouter.get("/session/:sessionId", orderController.getUserOrderBySessionIdController); // After checkout session

// Parameterized routes must come AFTER specific routes
orderRouter.get("/:orderId", orderController.getUserOrderByOrderIdController);
orderRouter.put("/:orderId", authorizeOrderAction, orderController.updatelOrderContoller);
orderRouter.patch("/:orderId", authorizeOrderAction, orderController.updatelOrderContoller);

module.exports = orderRouter;
