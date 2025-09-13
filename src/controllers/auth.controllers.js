const prisma = require("../db");
const bcrypt = require("bcryptjs");
const authConfig = require("../config/auth.config");
const jwt = require("jsonwebtoken");
const urlsConfig = require("../config/urls.config");
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

    // (user login while still logged in)
    const existingToken = req.cookies?.refreshToken;
    if (existingToken) {
      try {
        await prisma.refreshToken.updateMany({
          where: { token: existingToken, userId: user.id, revoked: false },
          data: { revoked: true },
        });
      } catch (err) {
        console.log("Error revoking old refresh token:", err);
      }
    }

    const accessToken = jwt.sign({userId: user.id}, authConfig.access_secret, {expiresIn: authConfig.access_expires});
    const refreshToken = jwt.sign({userId: user.id}, authConfig.refresh_secret, {expiresIn: authConfig.refresh_expires});

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // 5 days
      }
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
      sameSite: "strict",
    });

    return res.json({accessToken});

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

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({message: "Logged out successfully"});
  } catch (error) {
    console.log("Logout Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({message: "Refresh Token not found"});
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: {token: refreshToken},
    });

    if (!storedToken) {
      res.status(403).json({message: "Invalid Token"});
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
      res.status(403).json({message: "Revoked Token"});
    }

    // verify the refreshToken (e.g. expired)
    jwt.verify(refreshToken, authConfig.refresh_secret, (err, decoded) => {
      if (err || decoded.userId !== storedToken.userId) {
        console.log("Refresh Token Verify Error:", err);
        return res.status(403).json({message: "Invalid token"});
      }
    });

    const accessToken = jwt.sign({userId: user.id}, authConfig.access_secret, {expiresIn: authConfig.access_expires});
    res.json({accessToken});
  } catch (error) {
     console.log("Refresh Token Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


// Google Callback Controller
const googleCallbackController = async (req, res) => {
  // (user login while still logged in)
  const existingToken = req.cookies?.refreshToken;
  if (existingToken) {
    try {
      await prisma.refreshToken.updateMany({
        where: { token: existingToken, userId: user.id, revoked: false },
        data: { revoked: true },
      });
    } catch (err) {
      console.log("Error revoking old refresh token:", err);
    }
  }

  const refreshToken = jwt.sign(
    { userId: req.user.id },
    authConfig.refresh_secret,
    { expiresIn: authConfig.refresh_expires }
  );

  // add the refresh token in db
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: req.user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // 5 days
    }
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 5 // 5 days
  });

  const clientUrl = process.env.NODE_ENV === 'production' ? urlsConfig.clientUrlProd : urlsConfig.clientUrlDev;
  return res.redirect(clientUrl);
 
    
}

module.exports = {registerController, loginController, logoutController, refreshTokenController, googleCallbackController};