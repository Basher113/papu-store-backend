const prisma = require("../db");
const bcrypt = require("bcryptjs");
const authConfig = require("../config/auth.config");


const registerController = async (req, res) => {
  const {username, email, password, confirmPassword} = req.body;
  
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({message: "All fields are required"});
  };

    // Check if password and confirm password is equal
  if (password !== confirmPassword) {
    return res.status(400).json({message: "Passwords do not match"})
  }

  try {
    // Check if username is still valid
    const usernameInvalid = await prisma.user.findUnique({
      where: {username}
    });
    if (usernameInvalid) {
      return res.status(400).json({message: "Username already taken"});
    }

    // Check if email is still valid
    const emailInvalid = await prisma.user.findUnique({
      where: {email}
    });
    if (emailInvalid) {
      return res.status(400).json({message: "Email already taken"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    return res.status(201).json({message: "User registered successfully"});
  } catch (error) {
    console.log("Register Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }


};

module.exports = {registerController,};