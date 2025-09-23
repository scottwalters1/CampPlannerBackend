const { PutCommand, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const documentClient = require("../db/dynamoClient");

const { logger } = require("../util/logger");

const TableName = process.env.TRIPS_TABLE || "Trips";

async function createTrip(trip) {
  const command = new PutCommand({
    TableName: TRIPS_TABLE,
    Item: trip,
  });

  try {
    await documentClient.send(command);
    return trip;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function getTripByTripId(tripId) {
  const command = new GetCommand({
    TableName: TRIPS_TABLE,
    Key: { tripId },
  });

  try {
    const data = await documentClient.send(command);
    const trip = data.Item;
    return trip;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function deleteTripByTripId(tripId) {
  const command = new DeleteCommand({
    TableName: TRIPS_TABLE,
    Key: { tripId },
    ReturnValues: "ALL_OLD", // return the deleted item
  });

  try {
    const data = await documentClient.send(command);
    return data.Attributes; // not .Item
  } catch (error) {
    logger.error(error);
    return null;
  }
}

module.exports = {
    createTrip,
    getTripByTripId,
    deleteTripByTripId
};