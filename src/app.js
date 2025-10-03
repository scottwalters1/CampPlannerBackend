require("dotenv").config({
  path: "./.env",
  override: true,
});
const express = require("express");
const cors = require("cors");

// console.log(
//   "AWS keys from env:",
//   process.env.AWS_ACCESS_KEY_ID,
//   process.env.AWS_SECRET_ACCESS_KEY
// );

const cookieParser = require("cookie-parser");
const authenticateToken = require("./util/jwt");
const { loggerMiddleware } = require("./util/logger");
const { errorMiddleware } = require("./util/appError");
const userController = require("./controller/userController");
const tripController = require("./controller/tripController");

const RIDBController = require("./controller/RIDBController");

const app = express();
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

app.use("/users", userController);
app.use("/trips", authenticateToken, tripController);
app.use("/ridb", authenticateToken, RIDBController);

app.use(errorMiddleware);

// Only start server if NOT testing
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`API running on http://localhost:${PORT}`)
  );
}

module.exports = app;
