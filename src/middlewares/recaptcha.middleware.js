// backend/middleware/recaptchaMiddleware.js
const axios = require('axios');

const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;
  if (!captchaToken) {
    return res.status(400).json({ message: 'Please complete the CAPTCHA' });
  }
  const secretKey = process.env.CAPTCHA_SECRET_KEY;
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`
    );
    if (response.data.success) {
      next();
    } else {
      return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'CAPTCHA verification error' });
  }
};

module.exports = { verifyCaptcha };