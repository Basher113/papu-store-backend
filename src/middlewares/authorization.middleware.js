const prisma = require("../db");

const authorizeCartItemAction = async (req, res, next) => {
  const userId = req.user.id;
  const {cartItemId} = req.params;
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: {id: cartItemId},
      include: {cart: true,}, // To get access of the owner/user and check if the same user is updating it.
    });

    if (!cartItem) {
      return res.status(404).json({message: "CartItem not found."});
    }

    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({message: "Forbidden"});
    }
    next();
  } catch (error) {
    console.log("Authorize Cart Item Middleware Error:", error)
    return res.status(500).json("Unexpected Error")
  }
}

module.exports = {authorizeCartItemAction}