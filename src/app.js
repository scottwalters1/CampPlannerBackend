require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { loggerMiddleware } = require("./util/logger");
const userController = require("./controller/userController");
const tripController = require("./controller/tripController");

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use("/users", userController);
app.use("/trips", tripController)


// Only start server if NOT testing
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`API running on http://localhost:${PORT}`)
  );
}

module.exports = app;
