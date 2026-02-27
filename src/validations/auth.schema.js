const {z, email} = require("zod");

const emailSchema = z.email()
  .trim()
  .toLowerCase()
  .max(255, "Email too long.")

const usernameSchema = z.string()
  .min(6, "Username must be at least 6 characters long")
  .max(20, "Username must not exceed 20 characters")

// Password with strength requirements
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long.")
  .max(64, "Password is too long.")

// CAPTCHA token schema
const captchaSchema = z.string().min(1, "CAPTCHA verification is required");

const login = z.object({
  email: z.email().trim().toLowerCase().min(1, "Email is required."),
  password: z.string().min(1, "Password is required."),
  captchaToken: captchaSchema
});

const register = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Password confirmation is required."),
  captchaToken: captchaSchema
}).refine((data) => data.password === data.confirmPassword, {
  path: ["passwordConfirmation"],
  message: "Passwords do not match"
})

module.exports = {login, register}
