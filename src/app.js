const express = require("express");
const authRouter = require("./router/auth.router");
require("dotenv").config();

const app = express();

// parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/auth", authRouter);

const APP_PORT = process.env.APP_PORT;
app.listen(APP_PORT, () => console.log("Server starting on", APP_PORT));