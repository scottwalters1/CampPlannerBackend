const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

function createDocumentClient() {
  if (!process.env.AWS_REGION) {
    throw new Error("AWS_REGION is not set");
  }

  const client = new DynamoDBClient({ region: process.env.AWS_REGION });
  return DynamoDBDocumentClient.from(client);
}

module.exports = { createDocumentClient };