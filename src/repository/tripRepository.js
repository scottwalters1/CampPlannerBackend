const {
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
// const documentClient = require("../db/dynamoClient");
const { createDocumentClient } = require("../db/dynamoClient");
const documentClient = createDocumentClient();
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
  tripDescription,
  tripActivities = [],
  campGrounds = [],
  recAreaName,
  recAreaId,
  invitedUsers = [],
  startDate,
  endDate,
}) {
  const tripId = uuidv4();

  const normalizedOwnerId = ownerId.startsWith("USER#")
    ? ownerId
    : `USER#${ownerId}`;

  const trip = new Trip({
    tripId,
    tripName,
    tripDescription,
    tripActivities,
    campGrounds,
    recAreaName,
    recAreaId,
    ownerId: normalizedOwnerId,
    invitedUsers,
    startDate,
    endDate,
    createdAt: Date.now(),
  });

  const item = {
    PK: `TRIP#${trip.tripId}`,
    SK: "METADATA",
    ...trip,
    UserTripsIndexPK: normalizedOwnerId,
    UserTripsIndexSK: `TRIP#${trip.tripId}`,
  };

  await documentClient.send(
    new PutCommand({ TableName: TABLE_NAME, Item: item })
  );

  for (const user of invitedUsers) {
    const normalizedUserId = user.userID.startsWith("USER#")
      ? user.userID
      : `USER#${user.userID}`;

    const inviteItem = {
      PK: `TRIP#${tripId}`,
      SK: `INVITE#${normalizedUserId}`,
      UserInvitesIndexPK: normalizedUserId,
      UserInvitesIndexSK: `TRIP#${tripId}`,
      ownerId,
      tripId,
      tripName,
      recAreaName,
      tripDescription,
      inviteStatus: user.inviteStatus,
      username: user.username,
      createdAt: Date.now(),
    };

    await documentClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: inviteItem,
      })
    );
  }

  return item;
}

async function getTripsByUserId(userId) {

  const ownerPk = `USER#${userId}`;

  const ownerQuery = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "UserTripsIndex",
    KeyConditionExpression: "UserTripsIndexPK = :owner",
    ExpressionAttributeValues: {
      ":owner": ownerPk,
    },
  });

  const ownerResp = await documentClient.send(ownerQuery);
  const ownerTrips = (ownerResp.Items || []).map(trip => ({
    ...trip,
    isCreator: true,
  }));

  const invitesQuery = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "UserInvitesIndex",
    KeyConditionExpression: "UserInvitesIndexPK = :user",
    FilterExpression: "inviteStatus = :accepted",
    ExpressionAttributeValues: {
      ":user": ownerPk,
      ":accepted": "Accepted",
    },
  });

  const invitesResp = await documentClient.send(invitesQuery);
  const inviteItems = invitesResp.Items || []; 

  const invitedTripIds = inviteItems.map((invite) => invite.tripId);

  const invitedTrips = await Promise.all(
  invitedTripIds.map(async tripId => {
    const getCmd = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TRIP#${tripId}`,
        SK: "METADATA",
      },
    });
    const resp = await documentClient.send(getCmd);
    return {...resp.Item, isCreator: false};
  })
);
  const allTrips = [...ownerTrips, ...invitedTrips];

  return allTrips;
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
    ReturnValues: "ALL_OLD",
  });

  try {
    const data = await documentClient.send(command);
    return data.Attributes; // not .Item
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function findTripsByInvitedUser(userID) {
  const inviteResponse = await documentClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "UserInvitesIndex",
      KeyConditionExpression: "UserInvitesIndexPK = :userID",
      ExpressionAttributeValues: {
        ":userID": userID,
      },
    })
  );

  const invites = inviteResponse.Items || [];

  const trips = [];
  for (const invite of invites) {
    const tripResponse = await documentClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :tripPK AND SK = :metadata",
        ExpressionAttributeValues: {
          ":tripPK": `TRIP#${invite.tripId}`,
          ":metadata": "METADATA",
        },
      })
    );

    if (tripResponse.Items && tripResponse.Items.length > 0) {
      const trip = tripResponse.Items[0];
      trip.inviteStatus = invite.inviteStatus;
      trip.invitedUsername = invite.username;
      trips.push(trip);
    }
  }

  return trips;
}

async function findInvitesByUser(userID) {
  const normalizedUserID = userID.startsWith("USER#")
    ? userID
    : `USER#${userID}`;

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "UserInvitesIndex",
    KeyConditionExpression: "UserInvitesIndexPK = :userID",
    FilterExpression: "inviteStatus = :pending",
    ExpressionAttributeValues: {
      ":userID": normalizedUserID,
      ":pending": "Pending",
    },
  });

  const response = await documentClient.send(command);
  return response.Items || [];
}

async function updateInvite(userID, tripId, newStatus) {
  const normalizedUserID = userID.startsWith("USER#")
    ? userID
    : `USER#${userID}`;

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: "TRIP#" + tripId,
      SK: "INVITE#" + normalizedUserID,
    },
    UpdateExpression: "SET inviteStatus = :newStatus",
    ExpressionAttributeValues: {
      ":newStatus": newStatus,
    },

    ReturnValues: "ALL_NEW",
  });

  const response = await documentClient.send(command);
  return response.Attributes;
}

module.exports = {
  createTrip,
  getTripsByUserId,
  getTripByTripId,
  deleteTripByTripId,
  findTripsByInvitedUser,
  findInvitesByUser,
  updateInvite,
};
