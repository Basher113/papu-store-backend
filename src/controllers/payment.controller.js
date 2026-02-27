const prisma = require("../db");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const paymongoSecretKey = process.env.PAYMONGO_TEST_SECRET_KEY;
const paymongoWebhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

// Verify PayMongo webhook signature
const verifyPaymongoSignature = (payload, signature, timestamp) => {
  if (!paymongoWebhookSecret) {
    console.error("PAYMONGO_WEBHOOK_SECRET not configured");
    return false;
  }
  
  const composedPayload = timestamp + "." + payload;
  const expectedSignature = crypto
    .createHmac("sha256", paymongoWebhookSecret)
    .update(composedPayload)
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
};

const createPaymongoCheckoutSessionAndOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products, total, paymentMethod, addressData, isCheckoutFromCart } = req.body;

    // Get URLs from environment/config
    const clientUrl = process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL_PROD 
      : process.env.CLIENT_URL_DEV;
    
    const cancel_url = `${clientUrl}/checkout/`;
    const success_url = `${clientUrl}/checkout/order-confirmation`;
    
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
              products: JSON.stringify(products),
              addressData: JSON.stringify(addressData),
              isCheckoutFromCart: String(isCheckoutFromCart),
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
    // Verify webhook signature for security
    const signature = req.headers["paymongo-signature"];
    const timestamp = req.headers["paymongo-timestamp"];
    
    if (signature && timestamp && paymongoWebhookSecret) {
      const rawBody = JSON.stringify(req.body);
      const isValid = verifyPaymongoSignature(rawBody, signature, timestamp);
      
      if (!isValid) {
        console.error("Invalid webhook signature - possible spoofing attempt");
        return res.status(401).send("Invalid signature");
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error("Webhook signature verification failed - missing headers or secret");
      return res.status(401).send("Signature verification required in production");
    }
    
    const event = req.body.data;
    const type = event.attributes.type;
    
    if (
      type === "checkout_session.payment.paid" ||
      type === "payment.paid"
    ) {

      const session = event.attributes.data;
      const metadata = session.attributes.metadata;
      
      const {
        addressData,
        userId,
        products,
        isCheckoutFromCart,
        paymentMethod,
      } = {
        addressData: JSON.parse(metadata.addressData || "{}"),
        userId: metadata.userId,
        products: JSON.parse(metadata.products || "[]"),
        isCheckoutFromCart: metadata.isCheckoutFromCart === "true",
        paymentMethod: metadata.paymentMethod,
      };
      
      const amount = session.attributes.amount;

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

      // Create Payment Transaction
      await prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          paymentMethod: paymentMethod,
          transactionRef: session.id,
          amount: amount / 100,
          paidAt: new Date(),
          currency: "PHP",
          status: "PAID",
        },
      });

      // Clear cart if needed
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