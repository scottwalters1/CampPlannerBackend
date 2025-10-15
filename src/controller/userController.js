const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const userService = require("../service/userService");

const { authenticateToken } = require("../util/jwt");

router.get("/me", authenticateToken, (req, res) => {
  res.json({
    username: req.user.username,
    userID: req.user.userID,
  });
});

// Create new user
router.post("/register", async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({ message: `Registered User ${user.username}` });
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userService.login(username, password);
    // Generate JWT
    const token = jwt.sign(
      {
        username: user.username,
        userID: user.PK,
      },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   sameSite: "Strict",
    //   maxAge: 60 * 60 * 1000,
    // });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      maxAge: 60 * 60 * 1000,
    });
    res.status(202).json({
      message: `Logged in ${username}`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

function sanitizeUser(user) {
  const { hashedPassword, ...safeUser } = user;
  return safeUser;
}

// Get user by username
router.get("/username/:username", async (req, res, next) => {
  try {
    const user = await userService.getUserByUsername(req.params.username);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/id/:userId", async (req, res, next) => {
  try {
    const decodedId = decodeURIComponent(req.params.userId); // decode safely
    const user = await userService.getUserByUserId(decodedId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user by username
router.delete("/:username", async (req, res, next) => {
  try {
    const user = await userService.deleteUserByUsername(req.params.username);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// get username by id

module.exports = router;
