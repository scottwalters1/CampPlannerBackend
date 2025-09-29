const userRepository = require("../repository/userRepository");
const { logger } = require("../util/logger");
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const { AppError } = require("../util/appError");

/**
 * Registers a new user in the system.
 *
 * @param {Object} user - User data.
 * @param {string} user.username - The username for the new user.
 * @param {string} user.password - The password for the new user.
 * @returns {Object} The newly created user (without hashed password).
 * @throws {AppError} If the username is already registered.
 * @throws {AppError} If the username or password is invalid.
 * @throws {AppError} If the user could not be created in the database.
 * @example
 * const newUser = await register({ username: "alice", password: "secret123" });
 */
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

/**
 * Validates user input for username and password.
 *
 * @param {Object} user - User data.
 * @param {string} user.username
 * @param {string} user.password
 * @returns {boolean} True if valid, false otherwise.
 */
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

/**
 * Authenticates a user by username and password.
 *
 * @param {string} username - Username to login.
 * @param {string} password - Password to login.
 * @returns {Object} The authenticated user object.
 * @throws {AppError} If username or password is missing.
 * @throws {AppError} If credentials are invalid.
 * @example
 * const user = await login("alice", "secret123");
 */
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

/**
 * Retrieves a user by username.
 *
 * @param {string} username - The username to search for.
 * @returns {Object} The user object (without hashed password).
 * @throws {AppError} If username is invalid.
 * @throws {AppError} If user is not found.
 * @example
 * const user = await getUserByUsername("alice");
 */
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

/**
 * Removes hashed password from a user object.
 *
 * @param {Object} user - The user object from the database.
 * @returns {Object} The sanitized user object without hashed password.
 */
function sanitizeUser(user) {
  const { hashedPassword, ...safeUser } = user;
  return safeUser;
}

/**
 * Deletes a user by username.
 *
 * @param {string} username - The username of the user to delete.
 * @returns {Object} The deleted user object (without hashed password).
 * @throws {AppError} If username is invalid.
 * @throws {AppError} If user is not found.
 * @example
 * const deleted = await deleteUserByUsername("alice");
 */
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
  deleteUserByUsername,
};
