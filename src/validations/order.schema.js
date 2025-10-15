const {z} = require("zod");

const orderStatusSchema = z.enum(["PENDING", "SHIPPED", "CANCELLED", "DELIVERED", "REFUNDED",]);

module.exports = {orderStatusSchema}

