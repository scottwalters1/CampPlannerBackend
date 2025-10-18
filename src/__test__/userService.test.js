const userRepository = require("../repository/userRepository");
const userService = require("../service/userService");
const { logger } = require("../util/logger");
const bcrypt = require("bcryptjs");

jest.mock("../util/logger", () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../repository/userRepository", () => ({
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
  getUserByUserId: jest.fn(),
  deleteUserByUsername: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("User Service tests", () => {
  describe("register tests", () => {
    test("should throw AppError if username already exists", async () => {
      const mockUser = {
        SK: "PROFILE",
        UsernameIndexSK: "PROFILE",
        createdAt: 1759190786615,
        username: "bob",
        UsernameIndexPK: "USERNAME#bob",
        PK: "USER#8c8a1ed8-4ec0-4bdb-a59c-fa92d27498e4",
      };

      userRepository.getUserByUsername.mockResolvedValue(mockUser);

      await expect(
        userService.register({ username: "bob", password: "password" })
      ).rejects.toThrow("Username already registered");

      expect(logger.warn).toHaveBeenCalledWith(
        "Username already registered: bob"
      );
      expect(userRepository.getUserByUsername).toHaveBeenCalledWith("bob");
      expect(userRepository.createUser).not.toHaveBeenCalled();
    });

    test("should throw AppError if username or password is invalid", async () => {
      const invalidUser = { username: "noPass" };
      userRepository.getUserByUsername.mockResolvedValue(null);

      await expect(userService.register(invalidUser)).rejects.toThrow(
        "Invalid username or password"
      );

      expect(logger.warn).toHaveBeenCalledWith("Invalid username or password");
      expect(userRepository.createUser).not.toHaveBeenCalled();
    });

    test("should create user successfully if valid", async () => {
      const mockUser = { username: "alice", password: "password123" };
      const mockHashed = "hashed_pw";
      const mockCreatedUser = { username: "alice", hashedPassword: mockHashed };

      userRepository.getUserByUsername.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(mockHashed);
      userRepository.createUser.mockResolvedValue(mockCreatedUser);

      const result = await userService.register(mockUser);

      expect(userRepository.getUserByUsername).toHaveBeenCalledWith("alice");
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(userRepository.createUser).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Creating new user: alice");
      expect(result).toEqual(mockCreatedUser);
    });

    test("should throw AppError if createUser fails", async () => {
      const mockUser = { username: "carol", password: "pass123" };

      userRepository.getUserByUsername.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed_pw");
      userRepository.createUser.mockResolvedValue(null);

      await expect(userService.register(mockUser)).rejects.toThrow(
        "User not created"
      );

      expect(userRepository.createUser).toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe("validateUser tests", () => {
    test("should return true for valid username and password", () => {
      const result = userService.validateUser({
        username: "bob",
        password: "bobspassword",
      });
      expect(result).toBe(true);
    });

    test("should return false if username is missing", () => {
      const result = userService.validateUser({ password: "bobspassword" });
      expect(result).toBe(false);
    });

    test("should return false if password contains spaces", () => {
      const result = userService.validateUser({
        username: "bob",
        password: "bad password",
      });
      expect(result).toBe(false);
    });
  });

  describe("login tests", () => {
    test("should throw AppError if username is missing", async () => {
      await expect(userService.login(undefined, "password123")).rejects.toThrow(
        "Username and password are required"
      );
      expect(logger.warn).toHaveBeenCalledWith("Missing username or password");
    });

    test("should throw AppError if password is missing", async () => {
      await expect(userService.login("bob", undefined)).rejects.toThrow(
        "Username and password are required"
      );
      expect(logger.warn).toHaveBeenCalledWith("Missing username or password");
    });

    test("should throw AppError if user does not exist", async () => {
      userRepository.getUserByUsername.mockResolvedValue(null);

      await expect(
        userService.login("nonexistent", "password123")
      ).rejects.toThrow("Invalid credentials");
      expect(logger.warn).toHaveBeenCalledWith(
        "Login failed: invalid username nonexistent"
      );
      expect(userRepository.getUserByUsername).toHaveBeenCalledWith(
        "nonexistent"
      );
    });

    test("should throw AppError if password is incorrect", async () => {
      const mockUser = { username: "bob", hashedPassword: "hashed_pw" };
      userRepository.getUserByUsername.mockResolvedValue(mockUser);

      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(userService.login("bob", "wrongpass")).rejects.toThrow(
        "Invalid credentials"
      );
      expect(logger.warn).toHaveBeenCalledWith(
        "Login failed: invalid password for bob"
      );
    });

    test("should return user if credentials are correct", async () => {
      const mockUser = { username: "bob", hashedPassword: "hashed_pw" };
      userRepository.getUserByUsername.mockResolvedValue(mockUser);

      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const result = await userService.login("bob", "correctpass");

      expect(result).toEqual(mockUser);
      expect(logger.info).toHaveBeenCalledWith("Logged in bob");
    });
  });

  describe("getUserByUsername tests", () => {
    test("should return sanitized user if found", async () => {
      const mockUser = { username: "bob", hashedPassword: "secret" };
      userRepository.getUserByUsername.mockResolvedValue(mockUser);

      const result = await userService.getUserByUsername("bob");

      expect(userRepository.getUserByUsername).toHaveBeenCalledWith("bob");
      expect(result).toEqual({ username: "bob" });
      expect(logger.info).toHaveBeenCalledWith("Retrieved user: bob");
    });

    test("should throw AppError if user doesn't exist", async () => {
      userRepository.getUserByUsername.mockResolvedValue(null);

      await expect(
        userService.getUserByUsername("Nonexistentuser")
      ).rejects.toThrow("User not found");

      expect(userRepository.getUserByUsername).toHaveBeenCalledWith(
        "Nonexistentuser"
      );
      expect(logger.warn).toHaveBeenCalledWith(
        "User not found: Nonexistentuser"
      );
    });

    test("should throw AppError if username is missing", async () => {
      await expect(userService.getUserByUsername(undefined)).rejects.toThrow(
        "Invalid username"
      );

      expect(logger.warn).toHaveBeenCalledWith("Invalid username: undefined");
      expect(userRepository.getUserByUsername).not.toHaveBeenCalled();
    });

    test("should throw AppError if username is not a string", async () => {
      await expect(userService.getUserByUsername(123)).rejects.toThrow(
        "Invalid username"
      );

      expect(logger.warn).toHaveBeenCalledWith("Invalid username: 123");
      expect(userRepository.getUserByUsername).not.toHaveBeenCalled();
    });
  });

  describe("getUserByUserId tests", () => {
    test("should throw AppError if userId is missing", async () => {
      await expect(userService.getUserByUserId(undefined)).rejects.toThrow(
        "Invalid userId"
      );
      expect(logger.warn).toHaveBeenCalledWith("Invalid userId: undefined");
      expect(userRepository.getUserByUserId).not.toHaveBeenCalled();
    });

    test("should throw AppError if userId is not a string", async () => {
      await expect(userService.getUserByUserId(123)).rejects.toThrow(
        "Invalid userId"
      );
      expect(logger.warn).toHaveBeenCalledWith("Invalid userId: 123");
      expect(userRepository.getUserByUserId).not.toHaveBeenCalled();
    });

    test("should throw AppError if user is not found", async () => {
      userRepository.getUserByUserId.mockResolvedValue(null);

      await expect(
        userService.getUserByUserId("nonexistentId")
      ).rejects.toThrow("Id not found");
      expect(logger.warn).toHaveBeenCalledWith("Id not found: nonexistentId");
      expect(userRepository.getUserByUserId).toHaveBeenCalledWith(
        "nonexistentId"
      );
    });

    test("should return sanitized user if found", async () => {
      const mockUser = {
        userId: "abc123",
        username: "bob",
        hashedPassword: "secret",
      };
      userRepository.getUserByUserId.mockResolvedValue(mockUser);

      const result = await userService.getUserByUserId("abc123");

      expect(result).toEqual({ userId: "abc123", username: "bob" });
      expect(logger.info).toHaveBeenCalledWith("Retrieved user: abc123");
      expect(userRepository.getUserByUserId).toHaveBeenCalledWith("abc123");
    });
  });

  describe("sanitizeUser tests", () => {
    test("should remove hashedPassword from full user object", () => {
      const user = {
        PK: "USER#8c8a1ed8-4ec0-4bdb-a59c-fa92d27498e4",
        SK: "PROFILE",
        UsernameIndexPK: "USERNAME#alice",
        UsernameIndexSK: "PROFILE",
        createdAt: 1759190786615,
        userId: "123",
        username: "alice",
        hashedPassword: "secret",
        email: "alice@example.com",
      };

      const result = userService.sanitizeUser(user);

      expect(result).toEqual({
        PK: "USER#8c8a1ed8-4ec0-4bdb-a59c-fa92d27498e4",
        SK: "PROFILE",
        UsernameIndexPK: "USERNAME#alice",
        UsernameIndexSK: "PROFILE",
        createdAt: 1759190786615,
        userId: "123",
        username: "alice",
        email: "alice@example.com",
      });
      expect(result.hashedPassword).toBeUndefined();
    });
  });

  describe("deleteUserByUsername tests", () => {
    test("should throw AppError if username is missing", async () => {
      await expect(userService.deleteUserByUsername(undefined)).rejects.toThrow(
        "Invalid username"
      );
      expect(logger.warn).toHaveBeenCalledWith("Invalid username: undefined");
      expect(userRepository.deleteUserByUsername).not.toHaveBeenCalled();
    });

    test("should throw AppError if username is not a string", async () => {
      await expect(userService.deleteUserByUsername(123)).rejects.toThrow(
        "Invalid username"
      );
      expect(logger.warn).toHaveBeenCalledWith("Invalid username: 123");
      expect(userRepository.deleteUserByUsername).not.toHaveBeenCalled();
    });

    test("should throw AppError if user is not found", async () => {
      userRepository.deleteUserByUsername.mockResolvedValue(null);

      await expect(
        userService.deleteUserByUsername("nonexistent")
      ).rejects.toThrow("User not found");
      expect(logger.warn).toHaveBeenCalledWith("User not found: nonexistent");
      expect(userRepository.deleteUserByUsername).toHaveBeenCalledWith(
        "nonexistent"
      );
    });

    test("should return sanitized user if deletion is successful", async () => {
      const mockUser = {
        PK: "USER#8c8a1ed8-4ec0-4bdb-a59c-fa92d27498e4",
        SK: "PROFILE",
        UsernameIndexPK: "USERNAME#bob",
        UsernameIndexSK: "PROFILE",
        createdAt: 1759190786615,
        username: "bob",
        hashedPassword: "secret",
      };
      userRepository.deleteUserByUsername.mockResolvedValue(mockUser);

      const result = await userService.deleteUserByUsername("bob");

      expect(result).toEqual({
        PK: "USER#8c8a1ed8-4ec0-4bdb-a59c-fa92d27498e4",
        SK: "PROFILE",
        UsernameIndexPK: "USERNAME#bob",
        UsernameIndexSK: "PROFILE",
        createdAt: 1759190786615,
        username: "bob",
      });
      expect(result.hashedPassword).toBeUndefined();
      expect(logger.info).toHaveBeenCalledWith("Deleted user: bob");
      expect(userRepository.deleteUserByUsername).toHaveBeenCalledWith("bob");
    });
  });
});
