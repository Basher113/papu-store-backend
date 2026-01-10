const prisma = require("../db");
const axios = require("axios");
require("dotenv").config();

const paymongoSecretKey = process.env.PAYMONGO_TEST_SECRET_KEY;

const createPaymongoCheckoutSessionAndOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products, total, paymentMethod, addressData, isCheckoutFromCart } = req.body;

    // 1️⃣ Create PayMongo checkout session
    const cancel_url = "http://localhost:5173/checkout/"
    const success_url = "http://localhost:5173/checkout/order-confirmation"
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            amount: parseInt(total * 100), // PayMongo expects centavos
            payment_method_types: [paymentMethod],
            currency: "PHP",
            description: `Order checkout`,
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            cancel_url: cancel_url,
            success_url: success_url,
            billing: {
              name: addressData.fullName,
              email: req.user.email
            },
            line_items: products.map((product) => ({
              name: product.name,
              amount: parseInt(product.price * 100),
              currency: "PHP",
              quantity: parseInt(product.quantity),
              images: [
                product.imageUrl
              ]
            })),

            metadata: {
              userId,
              products,
              addressData,
              isCheckoutFromCart,
              paymentMethod,
            }
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(paymongoSecretKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const checkoutSession = response.data.data;
    let checkoutUrl = checkoutSession.attributes.checkout_url;

    return res.status(200).json({
        success: true,
        checkoutUrl,
        sessionId: checkoutSession.id,
        message: "Checkout session created successfully.",
      });

  } catch (error) {
    console.error("Checkout session error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create PayMongo checkout session.",
      error: error.response?.data || error.message,
    });
  }
};

const handlePaymongoWebhook = async (req, res) => {
  try {
    const event = req.body.data;
    const type = event.attributes.type;
    console.log("webhook before")
     if (
      type === "checkout_session.payment.paid" ||
      type === "payment.paid"
    ) {

      const session = event.attributes.data;
      const { metadata, amount } = JSON.stringify(session.attributes);
      
      const {
        addressData,
        userId,
        products,
        isCheckoutFromCart,
        paymentMethod, // 👈 MUST come from metadata
      } = JSON.parse(metadata);

      // Create Order
      const order = await prisma.order.create({
        data: {
          userId,
          status: "PROCESSING",
          orderItems: {
            createMany: {
              data: products.map((product) => ({
                productId: product.id,
                quantity: parseInt(product.quantity),
              })),
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

      // 2️⃣ Create Payment Transaction
      await prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          paymentMethod: paymentMethod, // 👈 now defined
          transactionRef: session.id,   // 👈 FIXED
          amount: amount / 100,
          paidAt: new Date(),           // 👈 will now persist correctly
          currency: "PHP",
          status: "PAID",
        },
      });

      // 3️⃣ Clear cart if needed
      if (isCheckoutFromCart) {
        await prisma.cartItem.deleteMany({
          where: {
            cart: {
              userId: userId,
            },
          },
        });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
};

module.exports = { createPaymongoCheckoutSessionAndOrder, handlePaymongoWebhook };