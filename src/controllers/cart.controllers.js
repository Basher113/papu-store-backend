const prisma = require("../db");

const getCartByUserController = async (req, res) => {
  try {
    const userCart = await prisma.cart.findMany({
      where: {userId: req.user.id},
    });
    return res.json(userCart);
  } catch (error) {
    console.log("Get Cart By User Error:", error);
    return res.status(500).json({message: "Unexpected Error."});
  }
}

module.exports = {getCartByUserController}