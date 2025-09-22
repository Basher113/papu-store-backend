const express = require("express");
const cors = require('cors')
const passport = require("passport");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const {configPassportJwt, configPassportGoogleOauth2} = require("./config/passport.config");
const authRouter = require("./router/auth.router");
const userRouter = require("./router/user.router");
const productRouter = require("./router/product.router");
const cartRouter = require("./router/cart.router");

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


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
app.use("/api/carts/", cartRouter);


const APP_PORT = process.env.APP_PORT;
app.listen(APP_PORT, () => console.log("Server starting on", APP_PORT));