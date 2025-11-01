const prisma = require("../db");
const axios = require("axios");
require("dotenv").config();

const paymongoSecretKey = process.env.PAYMONGO_TEST_SECRET_KEY;

const createPaymongoCheckoutSessionAndOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products, total, paymentMethod, addressData } = req.body;


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
              addressData
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
    if (type === "checkout_session.payment_paid") {
      // If user proceed or did not cancel in checkout session
      const session = event.attributes.data;
      const { metadata, amount } = session.attributes;
      const {addressData, userId, products} = metadata;

      const existingAddress = await prisma.address.findFirst({
        where: { userId },
      });

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          orderItems: {
            createMany: {
              data: products.map((product) => ({
                productId: product.id,
                quantity: parseInt(product.quantity),
              })),
            },
          },

          address: existingAddress // Fix this after all is working
            ? { connect: { id: existingAddress.id } }
            : {
                create: {
                  userId,
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

      await prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          paymentMethod,
          transactionRef: checkoutSession.id,
          amount: amount / 100, // since paymongo uses centavo
          paidAt: new Date(),
          currency: "PHP",
        },
      });
    }
    console.log("Webhook?")
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(500);
  }
};

module.exports = { createPaymongoCheckoutSessionAndOrder, handlePaymongoWebhook };