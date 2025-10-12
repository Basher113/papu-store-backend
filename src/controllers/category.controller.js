const prisma = require("../db");
const getCategoriesController = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    return res.json(categories);
  } catch (error) {
    console.log("get categories error:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

module.exports = {getCategoriesController};