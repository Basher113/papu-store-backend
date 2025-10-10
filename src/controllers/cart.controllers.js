const prisma = require("../db");

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
        quantity: {
          increment: parseInt(quantity),
        }
      },
      create: {
        productId: productId,
        cartId: userCart.id,
        quantity: parseInt(quantity)
      },
     
    })

    

    return res.json({message: "Add to cart succesfully."});
  } catch (error) {
    console.log("Add to Cart Error:", error);
    return res.status(500).json({message: "Unexpected result. Please try again later."});
  }
}

const updateCartItemController = async (req, res) => {
  const userId = req.user.id;
  const {cartItemId} = req.params;
  const {quantity} = req.body;
  try {

    const cartItem = await prisma.cartItem.update({
      where: {id: cartItemId},
      data: {quantity: parseInt(quantity)},
      include: {cart: true} // To get access of the owner/user and check if the same user is updating it.
    });

    if (!cartItem) {
      return res.status(404).json({message: "CartItem not found."});
    }
    
    if (cartItem.cart.userId !== userId) {
      return res.status(403).json({message: "Forbidden."})
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