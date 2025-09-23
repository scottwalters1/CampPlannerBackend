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

*/

async function createTrip() {

}

async function updateTrip() {

}

async function deleteTrip() {

}

async function getRecAreaByName(recAreaName) {
    // Wrong
    const response = await fetch(`https://ridb.recreation.gov/api/v1/recareas?query=${recAreaName}&apikey=${process.env.RIDB_API_KEY}&limit=50&offset=0&state=CO,VA,NC&activity=6,BOATING&latitude=-118.0186111&longitude=43.88037021&radius=9.75&lastupdated=10-01-2018`)
    const data = await response.json();
    if (response) {
        logger.info(`Get Recreation Area by Name: ${recAreaName} returned: ${JSON.stringify(data)}`);
        return response;
    } else {
        logger.info("Get Recreation Area by Name operation failed", JSON.stringify(data));
        return null;
    }
}

module.exports = {
    createTrip,
    updateTrip,
    deleteTrip,
    getRecAreaByName
};