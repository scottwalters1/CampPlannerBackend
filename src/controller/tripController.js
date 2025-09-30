const express = require("express");
const router = express.Router();
const tripService = require("../service/tripService");

// Create Trip Date
router.post("/:tripId", async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const data = await tripService.createTripDate({ ...req.body, tripId });
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Create Trip
router.post("/", async (req, res, next) => {
  try {
    const data = await tripService.createTrip(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Get Trips By Username
// TODO: change to get username from logged in user
router.get("/user/:username", async (req, res, next) => {
  try {
    const username = req.params.username;
    const trips = await tripService.getTripsByUsername(username);
    res.status(200).json(trips);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
