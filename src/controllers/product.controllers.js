const prisma = require("../db");

const getProductsController = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.json({products});
  } catch (error) {
    console.log("Get Products Error:", error);
    return res.status(500).json({message: "Getting Products Unexpected Error"});
  }
}

const getProductController = async (req, res) => {
  const {productId} = req.params;
  try {
    
    const product = await prisma.product.findUnique({
      where: {id: productId}
    })

    if (!product) {
      return res.status(404).json({message: "No product found"});
    }

    return res.json(product);
  } catch (error) {
    console.log("Get Products Error:", error);
    return res.status(500).json({message: "Getting Product Unexpected Error"});
  }
}

const createProductsController = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Not Allowed"
    });
  }

  const {name, description, imageUrl, price, discountPercent, stock, categories} = req.body;
  const formattedPrice = parseFloat(price).toFixed(2);
  const formattedDiscountPercent = discountPercent !== null ? parseFloat(discountPercent).toFixed(2) : null;
  // TODO: ADD CUSTOM VALIDATIONS OR USE VALIDATORS LIBRARY LIKE (zod, express-validators).

  try {
    const products = await prisma.product.create({
      name,
      description,
      imageUrl,
      price: Number(formattedPrice),
      discountPercent:formattedDiscountPercent ? Number(formattedDiscountPercent) : null,
      stock: parseInt(stock, 10),
      categories
    });
    return res.status(201).json({products});
  } catch (error) {
    console.log("Create Products Error:", error);
    return res.status(500).json({message: "Create Products Unexpected Error"});
  }
}

const updateProductController = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Not Allowed" });
  }

  const { productId } = req.params;
  const { name, description, imageUrl, price, discountPercent, stock, categories } = req.body;
  const formattedPrice = price !== undefined ? parseFloat(price).toFixed(2) : undefined;
  const formattedDiscountPercent = discountPercent !== undefined ? parseFloat(discountPercent).toFixed(2) : undefined;
  // TODO: ADD CUSTOM VALIDATIONS OR USE VALIDATORS LIBRARY LIKE (zod, express-validators).

  try {
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        imageUrl,
        price: formattedPrice ? Number(formattedPrice) : undefined,
        discountPercent: formattedDiscountPercent ? Number(formattedDiscountPercent) : undefined,
        stock: parseInt(stock, 10),
        categories,
      },
    });

    return res.json({ product: updatedProduct });
  } catch (error) {
    console.log("Update Product Error:", error);
    return res.status(500).json({message: "Update Products Unexpected Error"});
  }
}

const deleteProductController = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Not Allowed"
    });
  }
  const { productId } = req.params;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId },
    });
    return res.json({message: "Product Deleted Successfully"})
  } catch (error) {
    console.log("Delete Product Error:", error);
    return res.status(500).json({message: "Delete Product Error"})
  }
}

const getProductsInCategoryController = async (req, res) => {
  const {categoryName, cursorId} = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: {name: categoryName}
    })

    if (!category) {
      return res.status(404).json({message: `Category ${categoryName} does not exist`});
    }

    const limit = 10;
    const cursor = cursorId ? {id: cursorId} : undefined;
    const productsInCategory = await prisma.product.findMany({
      take: limit,
      where: {
        categories: {
          some: {id: category.id},
        },
      },
      cursor
    });
    return res.json({products: productsInCategory, cursorId});
  } catch (error) {
    console.log("Get Category Products Error:", error);
    return res.status(500).json({message: "Get Category Products Error"});
  }
}

module.exports = {getProductsController, createProductsController, updateProductController, deleteProductController, getProductsInCategoryController, getProductController};