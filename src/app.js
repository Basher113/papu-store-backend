const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const {configPassportJwt} = require("./config/passport.config");
const authRouter = require("./router/auth.router");
require("dotenv").config();

const app = express();

configPassportJwt(passport); // Use the configured jwt strategy
app.use(passport.initialize()); // enable passport

// parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/api/auth", authRouter);

const APP_PORT = process.env.APP_PORT;
app.listen(APP_PORT, () => console.log("Server starting on", APP_PORT));