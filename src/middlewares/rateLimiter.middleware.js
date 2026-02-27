const {rateLimit, ipKeyGenerator} = require("express-rate-limit");

// Rate limiting for authentication endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { message: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests from count (optional)
  skipSuccessfulRequests: false,
  // Use IP + X-Forwarded-For header for proxy support
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || ipKeyGenerator(req.ip);
  },
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP + X-Forwarded-For header for proxy support
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || ipKeyGenerator(req.ip);
  },
});

// Strict limiter for password reset/sensitive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: { message: "Too many attempts, please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || ipKeyGenerator(req.ip);
  },
});

// Cart rate limiter - for adding items to cart (per user)
const cartLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each user to 10 add-to-cart requests per minute
  message: { message: "Too many cart additions, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise fall back to IP
    if (req.user && req.user.id) {
      return req.user.id;
    }
    return req.headers['x-forwarded-for'] || ipKeyGenerator(req.ip);
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter,
  cartLimiter
};
