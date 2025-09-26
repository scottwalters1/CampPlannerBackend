const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const userService = require("../service/userService");
const {setToken} = require("../util/token");

// create new user

router.post("/register", validatePostUser, async (req, res, next) => {
  const user = await userService.register(req.body);

  if (user) {
    res.status(201).json({ message: `Registered User ${user.username}` });
  } else {
    res.status(400).json({ message: "User not created" });
  }
});

function validatePostUser(req, res, next) {
  const user = req.body;
  if (user.username && user.password) {
    next();
  } else {
    res.status(400).json({ message: "invalid username or password" });
  }
}

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  const user = await userService.login(username, password);
  if (user) {
    const token = jwt.sign(
      {
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "60m",
      }
    );
    setToken(token);
    res.status(202).json({
      token,
      message: `Logged in ${username}`,
    });
  } else {
    res.status(400).json({ message: "Login failed"});
  }
});

// get user by username
router.get("/:username", async (req, res) => {
  const user = await userService.getUserByUsername(req.params);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// delete user by username
router.delete("/:username", async (req, res) => {
  const user = await userService.deleteUserByUsername(req.params);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

module.exports = router;
