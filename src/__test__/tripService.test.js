const tripRepository = require("../repository/tripRepository");
const userRepository = require("../repository/userRepository");
const tripService = require("../service/tripService");
const { logger } = require("../util/logger");

jest.mock("../util/logger", () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../repository/tripRepository", () => ({
  createTrip: jest.fn(),
  getTripsByUserId: jest.fn(),
  findTripsByInvitedUser: jest.fn(),
  findInvitesByUser: jest.fn(),
  updateInvite: jest.fn(),
}));

jest.mock("../repository/userRepository", () => ({}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Trip Service tests", () => {
  describe("createTrip tests", () => {
    // trip object
    const tripData = {
      tripId: "e4898faf-62eb-4b24-9349-ec980877abd0",
      tripName: "Yosemite Trip",
      tripDescription: "Fall trip to Yosemite",
      tripActivities: [
        { activityName: "BIKING", dates: ["2025-10-18T04:00:00.000Z"] },
        { activityName: "CLIMBING", dates: ["2025-10-19T04:00:00.000Z"] },
        { activityName: "BOATING", dates: ["2025-10-20T04:00:00.000Z"] },
      ],
      campGrounds: [
        {
          campgroundName: "Porcupine Flat Campground",
          dates: ["2025-10-18T04:00:00.000Z"],
        },
        {
          campgroundName: "Yosemite Creek Campground",
          dates: ["2025-10-19T04:00:00.000Z"],
        },
        {
          campgroundName: "North Pines Campground",
          dates: ["2025-10-20T04:00:00.000Z"],
        },
      ],
      recAreaName: "Yosemite National Park",
      recAreaId: 2991,
      ownerId: "USER#7fc03c34-7d81-489a-b47e-b5e2df3e1541",
      ownerUsername: "alice",
      invitedUsers: [
        {
          username: "bob",
          userID: "USER#13fd41a6-17dd-498d-b2f3-f996b5e65c71",
          inviteStatus: "Pending",
        },
      ],
      startDate: "2025-10-18T04:00:00.000Z",
      endDate: "2025-10-20T04:00:00.000Z",
      createdAt: 1760826539849,
    };

    test("should throw AppError if trip creation fails", async () => {
      tripRepository.createTrip.mockResolvedValue(null);

      await expect(tripService.createTrip(tripData)).rejects.toThrow(
        "Trip could not be created"
      );

      expect(logger.warn).toHaveBeenCalledWith("Trip could not be created");
    });

    test("should create trip successfully", async () => {
      tripRepository.createTrip.mockResolvedValue(tripData);

      const result = await tripService.createTrip(tripData);

      expect(result).toEqual(tripData);
      expect(logger.info).toHaveBeenCalledWith("Created trip: Yosemite Trip");
      expect(tripRepository.createTrip).toHaveBeenCalledWith(tripData);
    });
  });

  describe("getTripsByUsername tests", () => {
    test("should fetch trips by user ID", async () => {
      const mockUser = {
        username: "bob",
        userID: "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc",
      };
      const mockTrips = [{ tripId: "trip1" }, { tripId: "trip2" }];

      tripRepository.getTripsByUserId.mockResolvedValue(mockTrips);

      const result = await tripService.getTripsByUsername(mockUser);

      expect(result).toEqual(mockTrips);
      expect(tripRepository.getTripsByUserId).toHaveBeenCalledWith(
        "ce9b3a6b-f2e5-4596-b10c-067bbf7991dc"
      );
      expect(logger.info).toHaveBeenCalledWith(
        "Fetching trips for user: bob (ce9b3a6b-f2e5-4596-b10c-067bbf7991dc)"
      );
    });
  });

  describe("getInvitedTrips tests", () => {
    test("should fetch invited trips for user", async () => {
      const mockUser = {
        username: "bob",
        userID: "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc",
      };
      const mockTrips = [{ tripId: "trip1" }];

      tripRepository.findTripsByInvitedUser.mockResolvedValue(mockTrips);

      const result = await tripService.getInvitedTrips(mockUser);

      expect(result).toEqual(mockTrips);
      expect(tripRepository.findTripsByInvitedUser).toHaveBeenCalledWith(
        "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc"
      );
    });
  });

  describe("getInvites tests", () => {
    test("should fetch invites for user", async () => {
      const mockUser = {
        username: "bob",
        userID: "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc",
      };
      const mockInvites = [{ inviteId: "invite1" }];

      tripRepository.findInvitesByUser.mockResolvedValue(mockInvites);

      const result = await tripService.getInvites(mockUser);

      expect(result).toEqual(mockInvites);
      expect(tripRepository.findInvitesByUser).toHaveBeenCalledWith(
        "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc"
      );
    });

    test("should return empty array if user has no invites", async () => {
      const mockUser = {
        username: "bob",
        userID: "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc",
      };
      tripRepository.findInvitesByUser.mockResolvedValue([]);

      const result = await tripService.getInvites(mockUser);

      expect(result).toEqual([]);
      expect(tripRepository.findInvitesByUser).toHaveBeenCalledWith(
        "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc"
      );
    });
  });

  describe("updateInvite tests", () => {
    test("should throw AppError for invalid status", async () => {
      const mockUser = { username: "bob", userID: "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc" };
      const body = { status: "Invalid" };

      await expect(
        tripService.updateInvite(mockUser, "trip123", body)
      ).rejects.toThrow("Invalid new status");
      expect(logger.warn).toHaveBeenCalledWith("Invalid new status: Invalid");
      expect(tripRepository.updateInvite).not.toHaveBeenCalled();
    });

    test("should update invite with valid status", async () => {
      const mockUser = { username: "bob", userID: "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc" };
      const body = { status: "Accepted" };
      const mockResult = { inviteId: "invite1", status: "Accepted" };

      tripRepository.updateInvite.mockResolvedValue(mockResult);

      const result = await tripService.updateInvite(mockUser, "trip123", body);

      expect(result).toEqual(mockResult);
      expect(tripRepository.updateInvite).toHaveBeenCalledWith(
        "USER#ce9b3a6b-f2e5-4596-b10c-067bbf7991dc",
        "trip123",
        "Accepted"
      );
    });
  });
});
