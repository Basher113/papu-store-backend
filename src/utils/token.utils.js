const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    authConfig.access_secret,
    { expiresIn: authConfig.access_expires }
  );
}

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    authConfig.refresh_secret,
    { expiresIn: authConfig.refresh_expires }
  );
}

module.exports = {generateAccessToken, generateRefreshToken}