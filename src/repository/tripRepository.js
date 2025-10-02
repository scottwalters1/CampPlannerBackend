const {
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const documentClient = require("../db/dynamoClient");
const { v4: uuidv4 } = require("uuid");
const Trip = require("../model/Trip");
const TripDate = require("../model/TripDate");

const { logger } = require("../util/logger");
const { Console } = require("winston/lib/winston/transports");

// const TableName = process.env.TRIPS_TABLE || "Trips";
const TABLE_NAME = process.env.CAMPPLANNER_TABLE || "CampPlanner_Table";

async function createTrip({
  ownerId,
  tripName,
  description,
  activities = [],
  recName,
  recAreaId,
  invitedUsers = [],
  startDate,
  endDate,
}) {
  const tripId = uuidv4();

  const trip = new Trip({
    tripId,
    tripName,
    description,
    activities,
    recName,
    recAreaId,
    ownerId,
    invitedUsers,
    startDate,
    endDate,
    createdAt: Date.now(),
  });

  const item = {
    PK: `TRIP#${trip.tripId}`,
    SK: "METADATA",
    ...trip,
    UserTripsIndexPK: `USER#${trip.ownerId}`,
    UserTripsIndexSK: `TRIP#${trip.tripId}`,
  };

  await documentClient.send(
    new PutCommand({ TableName: TABLE_NAME, Item: item })
  );

  return item;
}

// TODO: make it so logged in users can only create dates on their own trips
async function createTripDate({ tripId, date }) {
  const tripDate = new TripDate({
    tripId,
    date, // use UTC time
  });

  const item = {
    PK: `TRIP#${tripDate.tripId}`,
    SK: `DATE#${tripDate.date}`,
    ...tripDate,
  };

  await documentClient.send(
    new PutCommand({ TableName: TABLE_NAME, Item: item })
  );

  return item;
}

async function getTripsByUserId(userId) {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "UserTripsIndex",
    KeyConditionExpression: "UserTripsIndexPK = :owner",
    ExpressionAttributeValues: {
      ":owner": `USER#${userId}`,
    },
  });

  const data = await documentClient.send(command);
  return data.Items || [];
}

async function getTripByTripId(tripId) {
  const command = new GetCommand({
    TableName: TABLE_NAME,
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
    TableName: TABLE_NAME,
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
  createTripDate,
  getTripsByUserId,
  getTripByTripId,
  deleteTripByTripId,
};
