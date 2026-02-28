const prisma = require("../db");
const logger = require("../config/logger");

const authorizeCartItemAction = async (req, res, next) => {
  const userId = req.user.id;
  const {cartItemId} = req.params;
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: {id: cartItemId},
      include: {cart: true,},
    });

    if (!cartItem) {
      return res.status(404).json({message: "CartItem not found."});
    }

    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({message: "Forbidden"});
    }
    next();
  } catch (error) {
    logger.error("Authorize Cart Item Middleware Error:", error);
   return res.status(500).json({message: "Internal Service Error"});
  }
}

const authorizeOrderAction = async (req, res, next) => {
  const user = req.user;
  const {orderId} = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: {id: orderId}
    });

    if (!order) {
      return res.status(404).json({message: "Order not found."});
    }

    if (order.userId !== user.id && user.role === "CUSTOMER") { // Check if the user is not admin or if the same user is accessing the order
      return res.status(403).json({message: "Forbidden."});
    }
    next();
    
  } catch (error) {
    logger.error("Authorize Order Action Middleware Error:", error)
    return res.status(500).json({message: "Internal Service Error"});
  }
}
module.exports = {authorizeCartItemAction, authorizeOrderAction}