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
      where: {id: productId},
      include: {
        categories: {
          select: {
            name: true
          }
        }
      }
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
  // Input is already validated by Zod middleware

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        imageUrl,
        price: price,
        discountPercent: discountPercent,
        stock: stock,
      }
    });
    
    // Connect categories if provided
    if (categories && categories.length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          categories: {
            connect: categories.map(id => ({ id }))
          }
        }
      });
    }
    
    return res.status(201).json({product});
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
  // Input is already validated by Zod middleware

  try {
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (price !== undefined) updateData.price = price;
    if (discountPercent !== undefined) updateData.discountPercent = discountPercent;
    if (stock !== undefined) updateData.stock = stock;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    // Update categories if provided
    if (categories !== undefined) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          categories: {
            set: categories.map(id => ({ id }))
          }
        }
      });
    }

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
  const {categoryName} = req.params;
  const {cursorId, limit} = req.query;

  try {
    const category = await prisma.category.findUnique({
      where: {name: categoryName}
    })

    if (!category) {
      return res.status(404).json({message: `Category ${categoryName} does not exist`});
    }

    const productsInCategory = await prisma.product.findMany({
      take: parseInt(limit) + 1,
      where: {
        categories: {
          some: {id: category.id},
        },
      },
      cursor: cursorId ? {id: cursorId} : undefined,
    });

    let nextCursor = null;
    if (productsInCategory.length > parseInt(limit)) { // Check if has more products
      const lastProduct = productsInCategory.pop();
      nextCursor = lastProduct.id;
    }
    return res.json({products: productsInCategory, cursorId: nextCursor});
  } catch (error) {
    console.log("Get Category Products Error:", error);
    return res.status(500).json({message: "Get Category Products Error"});
  }
}

module.exports = {getProductsController, createProductsController, updateProductController, deleteProductController, getProductsInCategoryController, getProductController};