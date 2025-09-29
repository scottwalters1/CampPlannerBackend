const userRepository = require("../repository/userRepository");
const { logger } = require("../util/logger");
const bcrypt = require("bcryptjs");
const User = require("../model/User");

async function register(user) {
  if (await userRepository.getUserByUsername(user.username)) {
    logger.warn("Username already registered");
    throw new Error("Username already registered", 400);
  }
  if (validateUser(user)) {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(user.password, saltRounds);
    const userToAdd = new User({
      username: user.username,
      hashedPassword: hashed,
      createdAt: Date.now(),
    });

    const addedUser = await userRepository.createUser(userToAdd);
    logger.info(`Creating new user: ${user.username}`);
    return addedUser;
  } else {
    logger.warn("Invalid username or password");
    throw new Error("Invalid username or password", 400);
  }
}

function validateUser(user) {
  const usernameResult =
    user.username.length > 0 && !user.username.includes(" ");
  const passwordResult =
    user.password.length > 0 && !user.password.includes(" ");
  return usernameResult && passwordResult;
}

async function login(username, password) {
  const user = await userRepository.getUserByUsername(username);
  if (!user) {
    logger.warn("Invalid credentials");
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.hashedPassword);
  if (!valid) {
    logger.warn("Invalid credentials");
    throw new Error("Invalid credentials");
  }

  logger.info(`Logged in ${username}`);
  return user;
}

async function getUserByUsername(params) {
  const username = params.username;
  if (username === "" || typeof username !== "string") {
    throw new Error("Invalid username");
  }
  const user = await userRepository.getUserByUsername(username);
  if (!user) return null;
  return sanitizeUser(user);
}

// removing password before returning to controller
function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function deleteUserByUsername(params) {
    const deletedUser = await userRepository.deleteUserByUsername(params.username);
    return sanitizeUser(deletedUser);
}

module.exports = {
  register,
  login,
  getUserByUsername,
  deleteUserByUsername,
};
