const tripRepository = require("../repository/tripRepository");
const userRepository = require("../repository/userRepository");
const { logger } = require("../util/logger");
const { AppError } = require("../util/appError");
const { decodeJWT } = require("../util/jwt");

async function createTrip(tripData) {
  const trip = await tripRepository.createTrip(tripData);
  if (!trip) {
    logger.warn("Trip could not be created");
    throw new AppError("Trip could not be created", 500);
  }
  logger.info(`Created trip: ${tripData.tripName}`);
  return trip;
}

async function createTripDate(tripData) {
  const tripDate = await tripRepository.createTripDate(tripData);
  if (!tripDate) {
    logger.warn(`Trip date could not be created for trip ${tripData.tripId}`);
    throw new AppError("Trip date could not be created", 500);
  }
  logger.info(`Created trip date for trip ${tripData.tripId}`);
  return tripDate;
}

async function getTripsByUsername(username) {
  const user = await userRepository.getUserByUsername(username);
  if (!user) {
    logger.warn(`User not found: ${username}`);
    throw new AppError("User not found", 404);
  }

  const userId = user.PK.split("#")[1];
  logger.info(`Fetching trips for user: ${username} (${userId})`);
  const trips = await tripRepository.getTripsByUserId(userId);
  return trips;
}

async function getInvitedTrips(token) {
  const user = await decodeJWT(token);
  // console.log(user);
  const trips = await tripRepository.findTripsByInvitedUser(user.userID);
  return trips;
}

module.exports = {
  createTrip,
  createTripDate,
  getTripsByUsername,
  getInvitedTrips
};
