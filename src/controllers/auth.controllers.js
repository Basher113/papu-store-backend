const prisma = require("../db");
const bcrypt = require("bcryptjs");
const authConfig = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const urlsConfig = require("../config/urls.config");
const { generateAccessToken, generateRefreshToken } = require("../utils/token.utils");
require('dotenv').config();


const registerController = async (req, res) => {
  const {username, email, password} = req.body;
  console.log(email, "Email");
  try {
    // Check if email is still valid
    const emailInvalid = await prisma.user.findUnique({
      where: {email}
    });

    if (emailInvalid) {
      return res.status(400).json({errors: {"email": ["Email Already Taken"]}});
    }

    // Check if username is still valid
    const usernameInvalid = await prisma.user.findUnique({
      where: {username}
    });
    if (usernameInvalid) {
      return res.status(400).json({errors: {"username": ["Username Already Taken"]}});
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
  
  try {
    const user = await prisma.user.findUnique({
      where: {email},
    });
    if (!user) {
      return res.status(400).json({message: "Invalid Credentials"});
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({message: "Invalid Credentials"});
    }

    // (user login while still logged in)
    const existingToken = req.cookies?.refreshToken;
    if (existingToken) {
      console.log("Revoke existing")
      try {
        await prisma.refreshToken.update({
          where: { token: existingToken, userId: user.id, revoked: false },
          data: { revoked: true },
        });
      } catch (err) {
        console.log("Error revoking old refresh token:", err);
      }
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // 5 days
      }
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
      sameSite:  "None",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 15, // 15 minutes
      sameSite: "None",
    });
    const {id, email: userEmail, username, googleId, provider, role, createdAt, updatedAt } = user;
    return res.json({id, email: userEmail, username, googleId, provider, role, createdAt, updatedAt });

  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({error});
  }
};

const logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.update({
        where: {token: refreshToken},
        data: {revoked: true},
      });
    }

    // Clear cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.json({message: "Logged out successfully"});
  } catch (error) {
    console.log("Logout Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const refreshTokenController = async (req, res) => {

  // Add clean up for expired refresh tokens.
  try {
    await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } }, // expired
      ],
    },
  });
  } catch (e) {
    console.log("Error deleting xepired refresh tokens:", e)
  }

  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({message: "Refresh Token not found"});
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: {token: refreshToken},
    });

    if (!storedToken) {
      return res.status(403).json({message: "Invalid Token"});
    }

    if (storedToken.revoked) {
      // if the token is revoked it is possibly hacked.
      // in this case we can email or message the user like (detected unusual activity, send the IP + User-Agent of the request) to the user
      // revoke all the active tokens for that user

      // revoke all the active tokens
      await prisma.refreshToken.updateMany({
        where: {userId: storedToken.userId, revoked: false},
        data: {revoked: true}
      });
      return res.status(403).json({message: "Revoked Token"});
    }

    // verify the refreshToken (e.g. expired)
    jwt.verify(refreshToken, authConfig.refresh_secret, (err, decoded) => {
      if (err || decoded.userId !== storedToken.userId) {
        console.log("Refresh Token Verify Error:", err);
        return res.status(403).json({message: "Invalid token"});
      }
    });

    const accessToken = generateAccessToken(storedToken.userId);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 15, // 15 minutes
      sameSite:  "None",
    });

    res.json({message: "Refresh token successfully"});

  } catch (error) {
     console.log("Refresh Token Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


// Google Callback Controller
const googleCallbackController = async (req, res) => {
  // (user login while still logged in)
  const existingRefreshToken = req.cookies?.refreshToken;
  if (existingRefreshToken) {
    try {
      await prisma.refreshToken.updateMany({
        where: { token: existingRefreshToken},
        data: { revoked: true },
      });
    } catch (err) {
      console.log("Error revoking old refresh token:", err);
    }
  }

  const refreshToken = generateRefreshToken(req.user.id);
  const accessToken = generateAccessToken(req.user.id);
  try {
    // add the refresh token in db
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: req.user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // 5 days
      }
    });
  } catch (error) {
    console.log("Adding refresh token in db error:", error);
  }
  
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 1000 * 60 * 60 * 24 * 5 // 5 days in milliseconds
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite:  "None",
    maxAge: 1000 * 60 * 15 // 15 minutes in milliseconds
  });

  const clientUrl = process.env.NODE_ENV === 'production' ? urlsConfig.clientUrlProd : urlsConfig.clientUrlDev;
  return res.redirect(clientUrl);
}

module.exports = {registerController, loginController, logoutController, refreshTokenController, googleCallbackController};