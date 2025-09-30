const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Force SDK to only use credentials from environment variables
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});


const documentClient = DynamoDBDocumentClient.from(client);
module.exports = documentClient;
