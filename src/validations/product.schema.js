const {z} = require("zod");

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Product name too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  imageUrl: z.string().url("Must be a valid URL").max(500, "URL too long"),
  price: z.number().positive("Price must be positive").max(999999.99, "Price too high"),
  discountPercent: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").nullable().optional(),
  stock: z.number().int("Stock must be an integer").min(0, "Stock cannot be negative").max(999999, "Stock too high"),
  categories: z.array(z.string()).optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Product name too long").optional(),
  description: z.string().min(1, "Description is required").max(2000, "Description too long").optional(),
  imageUrl: z.string().url("Must be a valid URL").max(500, "URL too long").optional(),
  price: z.number().positive("Price must be positive").max(999999.99, "Price too high").optional(),
  discountPercent: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").nullable().optional(),
  stock: z.number().int("Stock must be an integer").min(0, "Stock cannot be negative").max(999999, "Stock too high").optional(),
  categories: z.array(z.string()).optional(),
});

module.exports = {productSchema, updateProductSchema};
