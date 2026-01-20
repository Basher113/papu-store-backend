const express = require("express");
const cors = require('cors')
const passport = require("passport");
const cookieParser = require("cookie-parser");
const urlsConfig = require("./config/urls.config")
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

app.use(cors({
  origin: process.env.NODE_ENV === "production" ? urlsConfig.clientUrlProd : urlsConfig.clientUrlDev,
  credentials: true
}));

console.log(urlsConfig.clientUrlDev, urlsConfig.clientUrlProd);
console.log(process.env.NODE_ENV === "production" ? urlsConfig.clientUrlProd : urlsConfig.clientUrlDev);


// Passport initilize
configPassportJwt(passport); // Use the configured jwt strategy
configPassportGoogleOauth2(passport); // Use google oauth strategy
app.use(passport.initialize()); // enable passport

// parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Routers
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/carts", passport.authenticate('jwt', { session: false }), cartRouter);


app.use("/api/orders/", (req, res, next) => {
    if (req.path === "/paymongo_webhook") return next(); // don't authenticate when in paymongo webhook
    passport.authenticate("jwt", { session: false })(req, res, next);
  }, orderRouter)
app.use("/api/addresses/", passport.authenticate('jwt', { session: false }), addressRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server starting on", PORT);
});