const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const documentClient = require("../db/dynamoClient");
const { v4: uuidv4 } = require("uuid");

const { logger } = require("../util/logger");

// const USERS_TABLE = process.env.USERS_TABLE || "Users";
const TABLE_NAME = process.env.CAMPPLANNER_TABLE || "CampPlanner";

async function createUser(user) {
  try {
    const userId = uuidv4();
    const item = {
      PK: `USER#${userId}`,
      SK: "PROFILE",
      username: user.username,
      hashedPassword: user.hashedPassword,
      createdAt: user.createdAt,
      GSI1PK: `USERNAME#${user.username}`,
      GSI1SK: "PROFILE",
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await documentClient.send(command);
    return { ...item, id: userId };
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function getUserByUsername(username) {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :username AND GSI1SK = :profile",
    ExpressionAttributeValues: {
      ":username": `USERNAME#${username}`,
      ":profile": "PROFILE",
    },
  });

  try {
    const data = await documentClient.send(command);
    if (data.Items && data.Items.length > 0) {
      return data.Items[0];
    }
    return null;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function deleteUserByUsername(username) {
  try {
    const user = await getUserByUsername(username);
    if (!user) return null;

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: user.PK,
        SK: user.SK,
      },
      ReturnValues: "ALL_OLD",
    });

    const data = await documentClient.send(command);
    return data.Attributes || null;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

module.exports = {
  createUser,
  getUserByUsername,
  deleteUserByUsername
};