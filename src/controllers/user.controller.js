const prisma = require("../db");

const getUsersController = async (req, res) => {
  // Only ADMIN users can access all users
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({message: "Forbidden - Admin access required"});
  }
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        provider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return res.json({users});
  } catch (error) {
    console.log("Error getting users:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
};

const getCurrentUserDataController = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({where: {id: req.user.id}});
    return res.json(user);
  } catch (error) {
    console.log("Error getting users:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

module.exports = {getUsersController, getCurrentUserDataController};