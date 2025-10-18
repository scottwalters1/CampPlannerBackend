// jest.mock("../util/logger", () => ({
//   logger: {
//     warn: jest.fn(),
//     info: jest.fn(),
//   },
// }));

// jest.mock("../repository/userRepository", () => ({
//   getUserByUsername: jest.fn(),
//   createUser: jest.fn(), // ✅ Added mock for createUser
// }));

// jest.mock("bcrypt", () => ({
//   hash: jest.fn(), // ✅ Mock bcrypt.hash
// }));

// jest.mock("../model/User", () => {
//   return jest.fn().mockImplementation((data) => data);
// });

// const userRepository = require("../repository/userRepository");
// const userService = require("../service/userService");
// const { logger } = require("../util/logger");
// const bcrypt = require("bcrypt");

// beforeEach(() => jest.clearAllMocks());

// describe("User Service Tests", () => {
//   describe("getUserByUsername Tests", () => {
//     test("should return sanitized user if found", async () => {
//       const mockUser = { username: "bob", hashedPassword: "secret" };
//       userRepository.getUserByUsername.mockResolvedValue(mockUser);

//       const result = await userService.getUserByUsername("bob");

//       expect(userRepository.getUserByUsername).toHaveBeenCalledWith("bob");
//       expect(result).toEqual({ username: "bob" }); // sanitized version
//       expect(logger.info).toHaveBeenCalledWith("Retrieved user: bob");
//     });

//     test("should throw AppError if user doesn't exist", async () => {
//       userRepository.getUserByUsername.mockResolvedValue(null);

//       await expect(
//         userService.getUserByUsername("Nonexistentuser")
//       ).rejects.toThrow("User not found");

//       expect(userRepository.getUserByUsername).toHaveBeenCalledWith(
//         "Nonexistentuser"
//       );
//       expect(userRepository.getUserByUsername).toHaveBeenCalledTimes(1);
//       expect(logger.warn).toHaveBeenCalledWith(
//         "User not found: Nonexistentuser"
//       );
//     });

//     test("should throw AppError if username is missing", async () => {
//       await expect(userService.getUserByUsername(undefined)).rejects.toThrow(
//         "Invalid username"
//       );

//       expect(logger.warn).toHaveBeenCalledWith("Invalid username: undefined");
//       expect(userRepository.getUserByUsername).not.toHaveBeenCalled();
//     });

//     test("should throw AppError if username is not a string", async () => {
//       await expect(userService.getUserByUsername(123)).rejects.toThrow(
//         "Invalid username"
//       );

//       expect(logger.warn).toHaveBeenCalledWith("Invalid username: 123");
//       expect(userRepository.getUserByUsername).not.toHaveBeenCalled();
//     });
//   });

//   describe("register", () => {
//     test("should throw AppError if username already exists", async () => {
//       const mockUser = { username: "bob", password: "password" };
//       userRepository.getUserByUsername.mockResolvedValue({ username: "bob" });

//       await expect(userService.register(mockUser)).rejects.toThrow(
//         "Username already registered"
//       );

//       expect(logger.warn).toHaveBeenCalledWith(
//         "Username already registered: bob"
//       );
//       expect(userRepository.getUserByUsername).toHaveBeenCalledWith("bob");
//       expect(userRepository.createUser).not.toHaveBeenCalled();
//     });

//     test("should throw AppError if username or password is invalid", async () => {
//       // missing password
//       const invalidUser = { username: "noPass" };
//       userRepository.getUserByUsername.mockResolvedValue(null);

//       await expect(userService.register(invalidUser)).rejects.toThrow(
//         "Invalid username or password"
//       );

//       expect(logger.warn).toHaveBeenCalledWith("Invalid username or password");
//       expect(userRepository.createUser).not.toHaveBeenCalled();
//     });

//     test("should create user successfully if valid", async () => {
//       const mockUser = { username: "alice", password: "password123" };
//       const mockHashed = "hashed_pw";
//       const mockCreatedUser = { username: "alice", hashedPassword: mockHashed };

//       userRepository.getUserByUsername.mockResolvedValue(null);
//       bcrypt.hash.mockResolvedValue(mockHashed);
//       userRepository.createUser.mockResolvedValue(mockCreatedUser);

//       const result = await userService.register(mockUser);

//       expect(userRepository.getUserByUsername).toHaveBeenCalledWith("alice");
//       expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
//       expect(userRepository.createUser).toHaveBeenCalled();
//       expect(logger.info).toHaveBeenCalledWith("Creating new user: alice");
//       expect(result).toEqual(mockCreatedUser);
//     });

//     test("should throw AppError if createUser fails", async () => {
//       const mockUser = { username: "carol", password: "pass123" };

//       userRepository.getUserByUsername.mockResolvedValue(null);
//       bcrypt.hash.mockResolvedValue("hashed_pw");
//       userRepository.createUser.mockResolvedValue(null);

//       await expect(userService.register(mockUser)).rejects.toThrow(
//         "User not created"
//       );

//       expect(userRepository.createUser).toHaveBeenCalled();
//       expect(logger.info).not.toHaveBeenCalled();
//     });
//   });

//   // 🧩 Future example placeholder for new service functions
//   // describe("createUser", () => {
//   //   test("should create a new user successfully", async () => {
//   //     ...
//   //   });
//   // });
// });

jest.mock("../util/logger", () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../repository/userRepository", () => ({
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

jest.mock("../model/User", () => {
  return jest.fn().mockImplementation((data) => data);
});

const userRepository = require("../repository/userRepository");
const userService = require("../service/userService");
const { logger } = require("../util/logger");
const bcrypt = require("bcryptjs");

beforeEach(() => {
  jest.clearAllMocks(); // clears calls
  jest.restoreAllMocks(); // restores original implementations for spies
});

describe("User Service Tests", () => {
  // ==============================================
  // getUserByUsername Tests
  // ==============================================
  describe("getUserByUsername", () => {
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

  // ==============================================
  // register Tests
  // ==============================================
  describe("register", () => {
    test("should throw AppError if username already exists", async () => {
      const mockUser = { username: "bob", password: "password" };
      userRepository.getUserByUsername.mockResolvedValue({ username: "bob" });

      await expect(userService.register(mockUser)).rejects.toThrow(
        "Username already registered"
      );

      expect(logger.warn).toHaveBeenCalledWith(
        "Username already registered: bob"
      );
      expect(userRepository.getUserByUsername).toHaveBeenCalledWith("bob");
      expect(userRepository.createUser).not.toHaveBeenCalled();
    });

    test("should throw AppError if username or password is invalid", async () => {
      const invalidUser = { username: "noPass" }; // missing password
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

  // ==============================================
  // validateUser Tests
  // ==============================================
  describe("validateUser", () => {
    test("should return true for valid username and password", () => {
      const result = userService.validateUser({
        username: "bob",
        password: "pass123",
      });
      expect(result).toBe(true);
    });

    test("should return false if username is missing", () => {
      const result = userService.validateUser({ password: "pass123" });
      expect(result).toBe(false);
    });

    test("should return false if password contains spaces", () => {
      const result = userService.validateUser({
        username: "bob",
        password: "bad pass",
      });
      expect(result).toBe(false);
    });
  });
});
