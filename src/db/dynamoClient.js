// const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
// const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// // DynamoDB client — credentials are automatically taken from the EC2 IAM role
// const client = new DynamoDBClient({
//   region: process.env.AWS_REGION,
// });


// const documentClient = DynamoDBDocumentClient.from(client);
// module.exports = documentClient;

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

/**
 * Returns a new DynamoDBDocumentClient instance
 * after env variables have been loaded
 */
function createDocumentClient() {
  if (!process.env.AWS_REGION) {
    throw new Error("AWS_REGION is not set");
  }

  const client = new DynamoDBClient({ region: process.env.AWS_REGION });
  return DynamoDBDocumentClient.from(client);
}

module.exports = { createDocumentClient };