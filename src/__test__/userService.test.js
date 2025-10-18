jest.mock("../util/logger", () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
  },
}));


jest.mock("../repository/userRepository", () => ({
  getUserByUsername: jest.fn(),
}));

const userRepository = require("../repository/userRepository");
const userService = require("../service/userService");
// const AppError = require("../util/appError");
const { logger } = require("../util/logger");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("User Service Tests", () => {
  test("getUserByUsername should throw AppError if user doesn't exist", async () => {
    // Mock the repository to return null
    userRepository.getUserByUsername.mockResolvedValue(null);

    await expect(
      userService.getUserByUsername("Nonexistentuser")
    ).rejects.toThrow("User not found");

    expect(userRepository.getUserByUsername).toHaveBeenCalledWith(
      "Nonexistentuser"
    );
    expect(userRepository.getUserByUsername).toHaveBeenCalledTimes(1);
  });

  test("getUserByUsername should return sanitized user if found", async () => {
    const mockUser = { username: "bob", hashedPassword: "secret" };
    userRepository.getUserByUsername.mockResolvedValue(mockUser);

    const result = await userService.getUserByUsername("bob");

    expect(userRepository.getUserByUsername).toHaveBeenCalledWith("bob");
    expect(result).toEqual({ username: "bob" }); // sanitized version
    expect(logger.info).toHaveBeenCalledWith("Retrieved user: bob");
  });
});
