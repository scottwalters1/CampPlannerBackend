// require("dotenv").config({ path: "./.env", override: true });
// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");

// const { authenticateToken } = require("./util/jwt");
// const { loggerMiddleware } = require("./util/logger");
// const { errorMiddleware } = require("./util/appError");
// const userController = require("./controller/userController");
// const tripController = require("./controller/tripController");
// const weatherController = require("./controller/weatherController");
// const RIDBController = require("./controller/ridbController");

// const app = express();

// // Environment log
// console.log("NODE_ENV:", process.env.NODE_ENV);

// // Allowed origin depending on environment
// const allowedOrigin =
//   process.env.NODE_ENV === "production"
//     ? "http://campplannerfrontend.s3-website-us-east-1.amazonaws.com" // S3 frontend URL
//     : "http://localhost:5173";

// // CORS setup
// app.use(
//   cors({
//     origin: allowedOrigin, // allow only frontend
//     credentials: true,     // allow cookies
//   })
// );

// app.use(express.json());
// app.use(cookieParser());
// app.use(loggerMiddleware);

// // Routes
// app.use("/users", userController);
// app.use("/trips", authenticateToken, tripController);
// app.use("/ridb", authenticateToken, RIDBController);
// app.use("/weather", weatherController);

// // Error handling
// app.use(errorMiddleware);

// // Start server (not in test)
// if (process.env.NODE_ENV !== "test") {
//   const PORT = process.env.PORT || 3000;

//   // Listen on all interfaces so EC2 is reachable externally
//   app.listen(PORT, "0.0.0.0", () =>
//     console.log(`API running on http://0.0.0.0:${PORT}`)
//   );
// }

// module.exports = app;

(async () => {
  // Load AWS SDK and fetch Parameter Store secrets
  const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
  const ssm = new SSMClient({ region: "us-east-1" }); // use your region

  async function getParameter(name, withDecryption = false) {
    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: withDecryption,
    });
    const response = await ssm.send(command);
    return response.Parameter.Value;
  }

  // Fetch all app secrets and environment variables
  process.env.PORT = await getParameter("/campplanner/PORT");
  process.env.JWT_SECRET = await getParameter("/campplanner/JWT_SECRET", true);
  process.env.RIDB_API_KEY = await getParameter(
    "/campplanner/RIDB_API_KEY",
    true
  );
  process.env.NODE_ENV = await getParameter("/campplanner/NODE_ENV");

  const express = require("express");
  const cors = require("cors");
  const cookieParser = require("cookie-parser");

  const { authenticateToken } = require("./util/jwt");
  const { loggerMiddleware } = require("./util/logger");
  const { errorMiddleware } = require("./util/appError");
  const userController = require("./controller/userController");
  const tripController = require("./controller/tripController");
  const weatherController = require("./controller/weatherController");
  const RIDBController = require("./controller/ridbController");

  const app = express();

  // Environment log
  console.log("NODE_ENV:", process.env.NODE_ENV);

  // Allowed origin depending on environment
  const allowedOrigin =
    process.env.NODE_ENV === "production"
      ? "http://campplannerfrontend.s3-website-us-east-1.amazonaws.com"
      : "http://localhost:5173";

  // CORS setup
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
    })
  );

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

  // Start server (not in test)
  if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`API running on http://0.0.0.0:${PORT}`)
    );
  }

  module.exports = app;
})();
