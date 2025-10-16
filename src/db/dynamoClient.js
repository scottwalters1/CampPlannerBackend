const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// DynamoDB client — credentials are automatically taken from the EC2 IAM role
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});


const documentClient = DynamoDBDocumentClient.from(client);
module.exports = documentClient;
