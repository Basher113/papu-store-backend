const {z} = require("zod");

const orderStatusSchema = z.enum(["PENDING", "SHIPPED", "CANCELLED", "DELIVERED", "REFUNDED", "PROCESSING"]);

const orderItemSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().optional(),
  price: z.string(),
  quantity: z.number().int().min(1).max(99),
  imageUrl: z.string().optional(),
});

const addressDataSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  phoneNumber: z.string().min(1, "Phone number is required").max(20),
  street: z.string().min(1, "Street is required").max(200),
  barangay: z.string().min(1, "Barangay is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
});

const createOrderSchema = z.object({
  products: z.array(orderItemSchema).min(1, "At least one product is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  total: z.number().positive("Total must be positive"),
  addressData: addressDataSchema,
  isCheckoutFromCart: z.boolean().optional(),
});

module.exports = {orderStatusSchema, createOrderSchema};
