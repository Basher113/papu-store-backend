const prisma = require("../db");
const bcrypt = require("bcryptjs");
const authConfig = require("../config/auth.config");
const jwt = require("jsonwebtoken");
require('dotenv').config();


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

// TODO: ADD LOGIN
const loginController = async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({message: "All fields are required"});
  }

  try {
    const user = await prisma.user.findUnique({
      where: {email}
    });
    if (!user) {
      return res.status(400).json({message: "Invalid Credentials"});
    }

    const isValidPassword = bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({message: "Invalid Credentials"});
    }

    const accessToken = jwt.sign({userId: user.id}, authConfig.access_secret, {expiresIn: authConfig.access_expires});
    const refreshToken = jwt.sign({userId: user.id}, authConfig.refresh_secret, {expiresIn: authConfig.refresh_expires});

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
    });

    return res.json({accessToken});

  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({error});
  }
}

module.exports = {registerController, loginController};