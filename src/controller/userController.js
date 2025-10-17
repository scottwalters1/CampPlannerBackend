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
    //   sameSite: "None", // required for cross-site
    //   secure: false, // must be false if using HTTP
    //   maxAge: 60 * 60 * 1000, // 1 hour
    // });
    // res.status(202).json({
    //   message: `Logged in ${username}`,
    //   user: sanitizeUser(user),
    // });
    res.status(202).json({
      message: `Logged in ${username}`,
      token,                  // <--- include token here
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

// get username by id
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


module.exports = router;
