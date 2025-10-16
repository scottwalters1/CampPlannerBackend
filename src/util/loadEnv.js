const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

const ssm = new SSMClient({ region: "us-east-1" });

async function getParameter(name, withDecryption = false) {
  const command = new GetParameterCommand({ Name: name, WithDecryption: withDecryption });
  const response = await ssm.send(command);
  return response.Parameter.Value;
}

async function loadEnv() {
  process.env.PORT = await getParameter("/campplanner/PORT");
  process.env.JWT_SECRET = await getParameter("/campplanner/JWT_SECRET", true);
  process.env.RIDB_API_KEY = await getParameter("/campplanner/RIDB_API_KEY", true);
  process.env.NODE_ENV = await getParameter("/campplanner/NODE_ENV");
}

module.exports = { loadEnv };