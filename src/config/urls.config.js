require("dotenv").config();

const urlsConfig = {
  // Server URLS
  serverUrlProd: process.env.SERVER_URL_PROD,
  serverUrlDev: process.env.SERVER_URL_DEV,

  // Google URLS
  googleAuthCallbackUrl: process.env.GOOGLE_AUTH_CALLBACK_URL,

  // Client URLS
  clientUrlProd: process.env.CLIENT_URL_PROD,
  clientUrlDev: process.env.CLIENT_URL_DEV,

  ngrokTestUrl: process.env.NGROK_TEST_URL
}

module.exports = urlsConfig;