(async () => {
  // --- Load environment variables ---
  if (process.env.NODE_ENV === "production") {
    // Deployed: fetch from Parameter Store
    const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
    const ssm = new SSMClient({ region: "us-east-1" }); // your region

    async function getParameter(name, withDecryption = false) {
      const command = new GetParameterCommand({
        Name: name,
        WithDecryption: withDecryption,
      });
      const response = await ssm.send(command);
      return response.Parameter.Value;
    }

    process.env.PORT = await getParameter("/campplanner/PORT");
    process.env.JWT_SECRET = await getParameter(
      "/campplanner/JWT_SECRET",
      true
    );
    process.env.RIDB_API_KEY = await getParameter(
      "/campplanner/RIDB_API_KEY",
      true
    );
    process.env.AWS_REGION = await getParameter("/campplanner/AWS_REGION");
    process.env.CAMPPLANNER_TABLE = await getParameter("/campplanner/CAMPPLANNER_TABLE");
    console.log("AWS region: ", process.env.AWS_REGION);
    console.log("table: ", process.env.CAMPPLANNER_TABLE);
  } else {
    // Local: load from .env
    require("dotenv").config({ path: "./.env", override: true });
  }

  const express = require("express");
  const cors = require("cors");
  const cookieParser = require("cookie-parser");

  const { authenticateToken } = require("./util/jwt");
  const { loggerMiddleware, logger} = require("./util/logger");
  const { errorMiddleware } = require("./util/appError");
  const userController = require("./controller/userController");
  const tripController = require("./controller/tripController");
  const weatherController = require("./controller/weatherController");
  const RIDBController = require("./controller/ridbController");

  // --- Express app setup ---
  const app = express();

  console.log("NODE_ENV:", process.env.NODE_ENV);

  const allowedOrigin =
    process.env.NODE_ENV === "production"
      ? "http://campplannerpipeline.s3-website-us-east-1.amazonaws.com"
      : "http://localhost:5173";

  app.use(cors({ origin: allowedOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(loggerMiddleware);

  // Routes
  app.use("/users", userController);
  app.use("/trips", authenticateToken, tripController);
  app.use("/ridb", authenticateToken, RIDBController);
  app.use("/weather", weatherController);

  // Error handling
  app.use(errorMiddleware);

  // Start server
  if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`API running on http://0.0.0.0:${PORT}`)
    );
  }

  module.exports = app;
})();
