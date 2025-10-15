const userRepository = require("../repository/userRepository");
const { logger } = require("../util/logger");
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const { AppError } = require("../util/appError");

async function register(user) {
  // Check if username already exists
  if (await userRepository.getUserByUsername(user.username)) {
    logger.warn(`Username already registered: ${user.username}`);
    throw new AppError("Username already registered", 400);
  }

  // Validate user input
  if (!validateUser(user)) {
    logger.warn("Invalid username or password");
    throw new AppError("Invalid username or password", 400);
  }

  // Hash password and create user
  const saltRounds = 10;
  const hashed = await bcrypt.hash(user.password, saltRounds);
  const userToAdd = new User({
    username: user.username,
    hashedPassword: hashed,
    createdAt: Date.now(),
  });

  // Send to DB
  const addedUser = await userRepository.createUser(userToAdd);

  if (addedUser) {
    logger.info(`Creating new user: ${user.username}`);
    return addedUser;
  } else {
    throw new AppError("User not created", 500);
  }
}

function validateUser(user) {
  return (
    user.username &&
    user.password &&
    user.username.length > 0 &&
    !user.username.includes(" ") &&
    user.password.length > 0 &&
    !user.password.includes(" ")
  );
}

async function login(username, password) {
  if (!username || !password) {
    logger.warn("Missing username or password");
    throw new AppError("Username and password are required", 400);
  }

  const user = await userRepository.getUserByUsername(username);
  if (!user) {
    logger.warn(`Login failed: invalid username ${username}`);
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, user.hashedPassword);
  if (!valid) {
    logger.warn(`Login failed: invalid password for ${username}`);
    throw new AppError("Invalid credentials", 401);
  }

  logger.info(`Logged in ${username}`);
  return user;
}

async function getUserByUsername(username) {
  if (!username || typeof username !== "string") {
    logger.warn(`Invalid username: ${username}`);
    throw new AppError("Invalid username", 400);
  }

  const user = await userRepository.getUserByUsername(username);

  if (!user) {
    logger.warn(`User not found: ${username}`);
    throw new AppError("User not found", 404);
  }

  logger.info(`Retrieved user: ${username}`);
  return sanitizeUser(user);
}

async function getUserByUserId(userId) {
  if (!userId || typeof userId !== "string") {
    logger.warn(`Invalid userId: ${userId}`);
    throw new AppError("Invalid userId", 400);
  }

  const user = await userRepository.getUserByUserId(userId);

  if (!user) {
    logger.warn(`Id not found: ${userId}`);
    throw new AppError("Id not found", 404);
  }

  logger.info(`Retrieved user: ${userId}`);
  return sanitizeUser(user);
}

function sanitizeUser(user) {
  const { hashedPassword, ...safeUser } = user;
  return safeUser;
}

async function deleteUserByUsername(username) {
  if (!username || typeof username !== "string") {
    logger.warn(`Invalid username: ${username}`);
    throw new AppError("Invalid username", 400);
  }

  const deletedUser = await userRepository.deleteUserByUsername(username);

  if (!deletedUser) {
    logger.warn(`User not found: ${username}`);
    throw new AppError("User not found", 404);
  }

  logger.info(`Deleted user: ${username}`);
  return sanitizeUser(deletedUser);
}

module.exports = {
  register,
  login,
  getUserByUsername,
  getUserByUserId,
  deleteUserByUsername,
};
