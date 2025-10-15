const prisma = require("../db");

const getUserOrdersController = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await prisma.order.findMany({
      where: {userId}
    }) || [];
    return res.json(orders);
  } catch (error) {
    console.log("get user orders error:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

const getUserOrderController = async (req, res) => {
  const userId = req.user.id;
  const {orderId} = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          }
        },
      }
    });
    if (!order) return res.status(404).json({message: "Order not found."});
    return res.json(order);
  } catch (error) {
    console.log("get user order error:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

const getUserOrderItemsController = async (req, res) => {
  const userId = req.user.id;
  try {
    const userOrders = await prisma.orderItem.findMany({
      where: {
        order: {
          userId
        }
      },
      include: {
        order: true,
        product: true,
      }
    });
    return res.json(userOrders);
  } catch (error) {
    console.log("get user orders error:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

const createOrderController = async (req, res) => {
  const userId = req.user.id;
  const {products} = req.body;
  
  try {
    await prisma.order.create({
      data: {
        userId,
        orderItems: {
          createMany: {
            data: products.map(product => ({productId: product.productId, quantity: parseInt(product.quantity)})),
          },
        },
      },
    });

    return res.status(201).json({message: "Order Succesfully."});
  } catch (error) {
    console.log("create order controller error:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

const updatelOrderContoller = async (req, res) => {
  const {orderId} = req.params;
  const {newStatus} = req.body;
  try {
    await prisma.order.update({
      where: {id: orderId},
      data: {
        status: newStatus.toUpperCase(),
      }
    });
    return res.json({message: "order updated"});
  } catch (error) {
    console.log("update order controller error:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

module.exports = { getUserOrdersController, getUserOrderController,
  getUserOrderItemsController, createOrderController, updatelOrderContoller,}