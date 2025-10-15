const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const documentClient = require("../db/dynamoClient");
const { v4: uuidv4 } = require("uuid");
const User = require("../model/User");

const { logger } = require("../util/logger");

// const USERS_TABLE = process.env.USERS_TABLE || "Users";
const TABLE_NAME = process.env.CAMPPLANNER_TABLE || "CampPlanner_Table";

async function createUser(userData) {
  
  try {
    const userId = uuidv4();
    const user = new User({
      username: userData.username,
      hashedPassword: userData.hashedPassword,
      createdAt: userData.createdAt,
    });

    const item = {
      PK: `USER#${userId}`,
      SK: "PROFILE",
      username: user.username,
      hashedPassword: user.hashedPassword,
      createdAt: user.createdAt,
      UsernameIndexPK: `USERNAME#${user.username}`,
      UsernameIndexSK: "PROFILE",
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
    IndexName: "UsernameIndex",
    KeyConditionExpression: "UsernameIndexPK = :username AND UsernameIndexSK = :profile",
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

async function getUserByUserId(userId) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: userId,   
      SK: "PROFILE",
    },
  };

  try {
    const data = await documentClient.send(new GetCommand(params));
    return data.Item || null;
  } catch (error) {
    console.error("Error fetching user:", error);
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
  deleteUserByUsername,
  getUserByUserId
};