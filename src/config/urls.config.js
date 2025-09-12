require("dotenv").config();

const urlsConfig = {
  serverUrlProd: process.env.SERVER_URL_PROD,
  serverUrlDev: process.env.SERVER_URL_DEV,
  googleAuthCallbackUrl: process.env.GOOGLE_AUTH_CALLBACK_URL
}

module.exports = urlsConfig;