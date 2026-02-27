const {z} = require("zod");

const addCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1").max(99, "Quantity cannot exceed 99"),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1").max(99, "Quantity cannot exceed 99"),
});

module.exports = {addCartItemSchema, updateCartItemSchema};
