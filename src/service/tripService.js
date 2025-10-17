const tripRepository = require("../repository/tripRepository");
const userRepository = require("../repository/userRepository");
const { logger } = require("../util/logger");
const { AppError } = require("../util/appError");
const { decodeJWT } = require("../util/jwt");

async function createTrip(tripData) {
  console.log(tripData);
  const trip = await tripRepository.createTrip(tripData);
  if (!trip) {
    logger.warn("Trip could not be created");
    throw new AppError("Trip could not be created", 500);
  }
  logger.info(`Created trip: ${tripData.tripName}`);
  return trip;
}

async function getTripsByUsername(user) {
  // const user = await decodeJWT(token);
  const username = user.username;
  const userID = user.userID.split("#")[1];
  console.log(userID);

  logger.info(`Fetching trips for user: ${username} (${userID})`);
  const trips = await tripRepository.getTripsByUserId(userID);
  return trips;
}

async function getInvitedTrips(user) {
  // const user = await decodeJWT(token);
  console.log(user);
  const trips = await tripRepository.findTripsByInvitedUser(user.userID);
  return trips;
}

async function getInvites(user) {
  // const user = await decodeJWT(token);
  // console.log(user);
  const invites = await tripRepository.findInvitesByUser(user.userID);
  return invites;
}

async function updateInvite(user, tripId, body) {
  // const user = await decodeJWT(token);
  const newStatus = body.status;
  if (!["Accepted", "Denied", "Pending"].includes(newStatus)) {
    logger.warn(`Invalid new status: ${newStatus}`);
    throw new AppError("Invalid new status", 404);
  }
  const data = tripRepository.updateInvite(user.userID, tripId, newStatus);
  return data;
}

module.exports = {
  createTrip,
  getTripsByUsername,
  getInvitedTrips,
  getInvites,
  updateInvite
};
