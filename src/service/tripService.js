const tripRepository = require('../repository/tripRepository');
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
    }

    or

    Table:
    user-id | trip-id | ... | tripObject

*/

// Fair warning: None of this was intended to be working yet
async function postTrip(user, trip) {
    const data = await tripRepository.createTrip({
        owner: user.username,
        tripId: trip.name,
        trip: trip
    })
    logger.info(`Creating new trip: ${JSON.stringify(data)}`);
    return data;
}

async function updateTrip(user, trip) {
    // const data = await tripRepository.postTrip();
}

async function deleteTrip(user, trip) {
    const data = await tripRepository.deleteTrip(user, trip)
    logger.info(`Deleting trip: ${JSON.stringify(trip)}`);
    return data;
}

async function getTripByTripId(tripId) {
    const data = await tripRepository.getTripByTripId(tripId);
    if (data) {
        logger.info(`Trip found by id: ${JSON.stringify(data)}`);
        return data;
    } else {
        logger.info(`Trip not found by id: ${tripId}`);
        return null;
    }
}

async function getRecAreaByName(recAreaName) {
    
}

module.exports = {
    postTrip,
    updateTrip,
    deleteTrip,
    getTripByTripId,
    getRecAreaByName
};