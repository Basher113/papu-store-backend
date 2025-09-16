const prisma = require("../db");

const getUsersController = async (req, res) => {
  try {
    const users = await prisma.user.findMany({include: {refreshTokens: true}});
    return res.json({users});
  } catch (error) {
    console.log("Error getting users:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
};

const getCurrentUserDataController = async (req, res) => {
  try {
    console.log(req.user);
    console.log(req.cookies.accessToken, "accessToken");
    const user = await prisma.user.findUnique({where: {id: req.user.id}});
    return res.json({user});
  } catch (error) {
    console.log("Error getting users:", error);
    return res.status(500).json({message: "Internal Service Error"});
  }
}

module.exports = {getUsersController, getCurrentUserDataController};