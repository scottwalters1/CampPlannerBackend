const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const userService = require("../service/userService");
const { setToken } = require("../util/token");

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
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    // // Set token in token.js - Find another way to manage this
    setToken(token);

    // res.status(202).json({
    //   token,
    //   message: `Logged in ${username}`,
    // });

    res.cookie("token", token, {
      // figure these out in greater detail
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });
    res.status(202).json({ message: `Logged in ${username}` });
  } catch (error) {
    next(error);
  }
});

// Get user by username
router.get("/:username", async (req, res, next) => {
  try {
    const user = await userService.getUserByUsername(req.params.username);
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
