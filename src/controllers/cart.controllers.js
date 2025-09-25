const prisma = require("../db");

const getCartByUserController = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const userCart = await prisma.cart.upsert({
      where: {userId: userId},
      update: {},
      create: {userId},
      include: {
        cartItems: true,
      }
    });
    return res.json(userCart);
  } catch (error) {
    console.log("Get Cart By User Error:", error);
    return res.status(500).json({message: "Unexpected Error."});
  }
}

const addCartItemToCartController = async (req, res) => {
  const userId = req.user.id;
  const {productId, quantity} = req.body;
  
  try {
    // Check if the product exist
    const existingProduct = await prisma.product.findUnique({
      where: {id: productId},
    });
    if (!existingProduct) {
      return res.status(404).json({message: "Product not found."});
    }

    // find or create user cart
    const userCart = await prisma.cart.upsert({
      where: {userId: userId},
      update: {},
      create: {
        userId: userId,
      },
    });
    

    // create or update cartItem quantity
    const cartItem = await prisma.cartItem.upsert({
      where: {
        productId_cartId: {
          productId: productId,
          cartId: userCart.id,
        },
      },
      update: {
        quantity: cartItem.quantity + quantity,
      },
      create: {
        productId: productId,
        cartId: userCart.id,
        quantity: quantity
      }
    })

    return res.json({message: "Add to cart succesfully."});
  } catch (error) {
    console.log("Add to Cart Error:", error);
    return res.status(500).json({message: "Unexpected result. Please try again later."});
  }
}

const updateCartItemController = async (req, res) => {
  const userId = req.user.id;
  const {productId} = req.params;
  const {quantity} = req.body;
  try {
    const userCart = await prisma.cart.findUnique({
      where: {userId: userId}
    });

    const cartItem = await prisma.cartItem.update({
      where: {
        productId_cartId: {
          productId: productId,
          cartId: userCart.id,
        },
        data: {
          quantity: item.quantity + quantity
        }
      },

    });

    if (!cartItem) {
      return res.status(400).json({message: "CartItem not found."});
    }

    return res.json({message: "Updated Succesfully."});
  } catch (error) {
    console.log("Delete Cart Item Controller Error:", error);
    return res.status(500).json("Unexpected Error.");
  }
}

const deleteCartItemController = async (req, res) => {
  const userId = req.user.id;
  const {productId} = req.params;
  try {
    const userCart = await prisma.cart.findUnique({
      where: {userId: userId}
    });

    const cartItem = await prisma.cartItem.delete({
      where: {
        productId_cartId: {
          productId: productId,
          cartId: userCart.id,
        },
      },
    });

    if (!cartItem) {
      return res.status(400).json({message: "CartItem not found."});
    }
    return res.json({message: "Deleted Succesfully."});
  } catch (error) {
    console.log("Delete Cart Item Controller Error:", error);
    return res.status(500).json("Unexpected Error.");
  }
}




module.exports = {getCartByUserController, addCartItemToCartController, updateCartItemController, deleteCartItemController}