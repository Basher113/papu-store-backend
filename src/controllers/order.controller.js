const prisma = require("../db");

const getUserOrdersController = async (req, res) => {
  const userId = req.user.id;
  const {status, search, cursorId, limit} = req.query;
  
  try {
    const where = { userId };

    // Filter by status
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Search filter
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        {
          orderItems: {
            some: {
              product: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          }
        }
      ];
    }

    // Get counts for each status
    const [allCount, pendingCount, processingCount, shippedCount, deliveredCount, cancelledCount] = await Promise.all([
      prisma.order.count({ where: { ...where, status: undefined } }),
      prisma.order.count({ where: { ...where, status: 'PENDING' } }),
      prisma.order.count({ where: { ...where, status: 'PROCESSING' } }),
      prisma.order.count({ where: { ...where, status: 'SHIPPED' } }),
      prisma.order.count({ where: { ...where, status: 'DELIVERED' } }),
      prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    const orders = await prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit) + 1,
        cursor: cursorId ? {id: cursorId} : undefined,
      })

    let nextCursor = null;
    if (orders.length > parseInt(limit)) {
      const lastOrder = orders.pop();
      nextCursor = lastOrder.id;
    }
    
    return res.json({
      orders,
      cursorId: nextCursor,
      counts: {
        all: allCount,
        PENDING: pendingCount,
        PROCESSING: processingCount,
        SHIPPED: shippedCount,
        DELIVERED: deliveredCount,
        CANCELLED: cancelledCount,
      }
    });
  
  } catch (error) {
    console.log("get user orders error:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

const getUserOrderByOrderIdController = async (req, res) => {
  const userId = req.user.id;
  const {orderId} = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
      include: {
        orderItems: true,
        payment: true,
        address: true
      },
      
    });
    if (!order) return res.status(404).json({message: "Order not found."});
    return res.json(order);
  } catch (error) {
    console.log("get user order error:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

const getUserOrderBySessionIdController = async (req, res) => {
  const {sessionId} = req.params;

  try {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: {transactionRef: sessionId},
      include: {
        order: {
          include: {
            orderItems: true,
          }
        }
      }
    });
    if (!transaction) return res.status(404).json({message: "No orders found"});
    const order = transaction.order;
    return res.status(200).json(order);
  } catch (error) {
    console.log("Get user order by session id error:", error)
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
  const {products, paymentMethod, total, addressData, isCheckoutFromCart} = req.body;
  
  try {

    // Use prisma.$transaction to ensure all operations succeed or all fail together
    const order = await prisma.$transaction(async (tx) => {
      // Step 1: Create the Order with orderItems and address
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderItems: {
            createMany: {
              data: products.map(product => ({productId: product.id, quantity: parseInt(product.quantity)})),
            },
          },
          address: {
            create: {
              fullName: addressData.fullName,
              phoneNumber: addressData.phoneNumber,
              barangay: addressData.barangay,
              street: addressData.street,
              city: addressData.city,
              postalCode: addressData.postalCode,
            },
          },
        },
      });

      // Step 2: Create the PaymentTransaction linked to the order
      await tx.paymentTransaction.create({
        data: {
          orderId: newOrder.id,
          paymentMethod: paymentMethod,
          amount: total,
          currency: "PHP",
        },
      });

      // Step 3: Clear the user's cart if checkout is from cart
      if (isCheckoutFromCart) {
        await tx.cartItem.deleteMany({
          where: {
            cart: {
              userId: userId
            }
          }
        });
      }

      // Return the created order
      return newOrder;
    });

    return res.status(201).json({orderId: order.id, checkoutUrl: "http://localhost:5173/checkout/order-confirmation", message: "Order Succesfully."});
    
  } catch (error) {
    console.log("create order controller error:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

const updatelOrderContoller = async (req, res) => {
  const {orderId} = req.params;
  const {newStatus} = req.body;
  
  // Validate status
  const validStatuses = ["PENDING", "SHIPPED", "CANCELLED", "DELIVERED", "REFUNDED", "PROCESSING"];
  if (!newStatus || !validStatuses.includes(newStatus.toUpperCase())) {
    return res.status(400).json({message: "Invalid order status"});
  }
  
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

module.exports = { getUserOrdersController, getUserOrderByOrderIdController, getUserOrderBySessionIdController,
  getUserOrderItemsController, createOrderController, updatelOrderContoller,}