require('dotenv').config();

const authConfig = {
  access_secret: process.env.AUTH_ACCESS_SECRET,
  access_expires: process.env.AUTH_ACCESS_EXPIRES,

  refresh_secret: process.env.AUTH_REFRESH_SECRET,
  refresh_expires: process.env.AUTH_REFRESH_EXPIRES
};

module.exports = authConfig;