require("dotenv").config();
const express = require("express");

const { loggerMiddleware } = require("./util/logger");


const app = express();
app.use(express.json());
app.use(loggerMiddleware);


// Only start server if NOT testing
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`API running on http://localhost:${PORT}`)
  );
}

module.exports = app;
