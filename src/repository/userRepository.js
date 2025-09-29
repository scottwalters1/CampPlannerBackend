const { PutCommand, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient({ region: "us-east-1" });
const documentClient = DynamoDBDocumentClient.from(client);
const { logger } = require("../util/logger");

const USERS_TABLE = process.env.USERS_TABLE || "Users";

async function createUser(user) {
  const command = new PutCommand({
    TableName: USERS_TABLE,
    Item: user,
  });

  try {
    await documentClient.send(command);
    return user;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function getUserByUsername(username) {
  const command = new GetCommand({
    TableName: USERS_TABLE,
    Key: { username },
  });

  try {
    const data = await documentClient.send(command);
    const user = data.Item;
    return user;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function deleteUserByUsername(username) {
  const command = new DeleteCommand({
    TableName: USERS_TABLE,
    Key: { username },
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
  createUser,
  getUserByUsername,
  deleteUserByUsername
};
