const prisma = require("../db");
const logger = require("../config/logger");

const getCartByUserController = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const userCart = await prisma.cart.upsert({
      where: {userId: userId},
      update: {},
      create: {userId},
    });

    const userCartItems = await prisma.cartItem.findMany({
      where: {
        cartId: userCart.id
      },
      orderBy: {
        id: "desc",
      },
      include: {
        product: true,
      },
    })
  
    return res.json(userCartItems);
  } catch (error) {
    logger.error("Get Cart By User Error:", error);
    return res.status(500).json({message: "Unexpected Error."});
  }
}

const addCartItemToCartController = async (req, res) => {
  const userId = req.user.id;
  const {productId, quantity} = req.body; // Already validated by Zod middleware
  try {
    // Check if the product exist
    const existingProduct = await prisma.product.findUnique({
      where: {id: productId},
    });
    if (!existingProduct) {
      return res.status(404).json({message: "Product not found."});
    }

    // Check if there's enough stock
    if (existingProduct.stock < quantity) {
      return res.status(400).json({message: "Not enough stock available."});
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
        quantity: {
          increment: quantity,
        }
      },
      create: {
        productId: productId,
        cartId: userCart.id,
        quantity: quantity
      },
     
    })

    return res.json({message: "Add to cart succesfully."});
  } catch (error) {
    logger.error("Add to Cart Error:", error);
    return res.status(500).json({message: "Unexpected result. Please try again later."});
  }
}

const updateCartItemController = async (req, res) => {
  const {cartItemId} = req.params;
  const {quantity} = req.body; // Already validated by Zod middleware
  try {
    // Get cart item with product info to check stock
    const cartItem = await prisma.cartItem.findUnique({
      where: {id: cartItemId},
      include: {product: true}
    });
    
    if (!cartItem) {
      return res.status(404).json({message: "Cart item not found."});
    }
    
    // Check if there's enough stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({message: "Not enough stock available."});
    }
    
    await prisma.cartItem.update({
      where: {id: cartItemId},
      data: {quantity: quantity},
    })

    return res.json({message: "Updated Succesfully."});
  } catch (error) {
    logger.error("Update Cart Item Controller Error:", error);
    return res.status(500).json("Unexpected Error.");
  }
}

const deleteCartItemController = async (req, res) => {
  const {cartItemId} = req.params;
  try {
    await prisma.cartItem.delete({
      where: {id: cartItemId},
    });

    return res.json({message: "Item deleted."});
  } catch (error) {
    logger.error("Delete Cart Item Controller Error:", error);
    return res.status(500).json("Unexpected Error.");
  }
}




module.exports = {getCartByUserController, addCartItemToCartController, updateCartItemController, deleteCartItemController}