const tripRepository = require("../repository/tripRepository");
const userRepository = require("../repository/userRepository");
const { logger } = require("../util/logger");

/*
    Trip {
        TripID: UUID | ID + tripName string
        Owner: UUID | Username
        Description: string (?)
        Guests: List(Users)
        RecArea: Object
        TripDates: List(tripDate)
    }

    tripDate {
        Date: DateTime
        Activities: List(Activity) - Set times?
        CampsiteID: String
    }

*/

async function createTrip(tripData) {
  return tripRepository.createTrip(tripData);
}

async function createTripDate(tripData) {
  return tripRepository.createTripDate(tripData);
}

async function getTripsByUsername(username) {
  const user = await userRepository.getUserByUsername(username);
  if (!user) throw new Error("User not found");
  console.log("user id: ", user.PK.split("#")[1]);
  const trips = await tripRepository.getTripsByUserId(user.PK.split("#")[1]);
  return trips;
}

async function updateTrip() {}

async function deleteTrip() {}

async function getRecAreaByName(recAreaName) {
  // Wrong
  const response = await fetch(
    `https://ridb.recreation.gov/api/v1/recareas?query=${recAreaName}&apikey=${process.env.RIDB_API_KEY}&limit=50&offset=0&state=CO,VA,NC&activity=6,BOATING&latitude=-118.0186111&longitude=43.88037021&radius=9.75&lastupdated=10-01-2018`
  );
  const data = await response.json();
  if (response) {
    logger.info(
      `Get Recreation Area by Name: ${recAreaName} returned: ${JSON.stringify(
        data
      )}`
    );
    return response;
  } else {
    logger.info(
      "Get Recreation Area by Name operation failed",
      JSON.stringify(data)
    );
    return null;
  }
}

module.exports = {
  createTrip,
  createTripDate,
  getTripsByUsername,
  updateTrip,
  deleteTrip,
  getRecAreaByName,
};
