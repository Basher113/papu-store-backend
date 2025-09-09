const express = require("express");
require("dotenv").config();
const app = express();

// parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
  return res.json({message: "Hello World!"});
});

const APP_PORT = process.env.APP_PORT;
app.listen(APP_PORT, () => console.log("Server starting on", APP_PORT));