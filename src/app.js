const express = require("express");
const app = express();
const { loggerMiddleware } = require("./util/logger");

//Middleware
app.use(express.json());
app.use(loggerMiddleware);

//Routes

module.exports = app;