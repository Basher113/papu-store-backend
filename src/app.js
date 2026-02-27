const express = require("express");
const cors = require('cors');
const passport = require("passport");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const urlsConfig = require("./config/urls.config");
const { authLimiter, apiLimiter } = require("./middlewares/rateLimiter.middleware");
require("dotenv").config();

const {configPassportJwt, configPassportGoogleOauth2} = require("./config/passport.config");
const authRouter = require("./router/auth.router");
const userRouter = require("./router/user.router");
const productRouter = require("./router/product.router");
const cartRouter = require("./router/cart.router");
const categoryRouter = require("./router/catgegory.router");
const orderRouter = require("./router/order.router");
const addressRouter = require("./router/address.router");

const app = express();

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Apply general rate limiting to all API routes
app.use("/api/", apiLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? urlsConfig.clientUrlProd : urlsConfig.clientUrlDev,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// Passport initialize
configPassportJwt(passport);
configPassportGoogleOauth2(passport);
app.use(passport.initialize());

// Body parsers
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

// Routers
app.use("/api/auth", authLimiter, authRouter); // Apply stricter rate limit to auth
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/carts", passport.authenticate('jwt', { session: false }), cartRouter);

app.use("/api/orders/", (req, res, next) => {
    if (req.path === "/paymongo_webhook") return next(); // don't authenticate when in paymongo webhook
    passport.authenticate("jwt", { session: false })(req, res, next);
  }, orderRouter);
app.use("/api/addresses/", passport.authenticate('jwt', { session: false }), addressRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server starting on", PORT);
});
