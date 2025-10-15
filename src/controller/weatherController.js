const express = require("express");
const router = express.Router();
const weatherService = require("../service/weatherService");

router.get("/", async (req, res, next) =>{
  try {
    const weather = await weatherService.getWeatherByQuery(req.query);
    res.status(200).json(weather);
  } catch (error) {
    next(error)
  }
})

module.exports = router;