const express = require("express");
const router = express.Router();
const tripService = require("../service/tripService");

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
router.get("/", async (req, res, next) => {
  try {
    // const token = req.cookies.token;
    const user = req.user;
    const trips = await tripService.getTripsByUsername(user);
    res.status(200).json(trips);
  } catch (error) {
    next(error);
  }
});

router.get("/invitedtrips", async (req, res, next) => {
  try {
    // const token = req.cookies.token;
    const trips = await tripService.getInvitedTrips(req.user);
    res.status(200).json(trips);
  } catch (error) {
    next(error);
  }
});

router.get("/invites", async (req, res, next) => {
  try {
    // const token = req.cookies.token;
    const invites = await tripService.getInvites(req.user);
    res.status(200).json(invites);
  } catch (error) {
    next(error);
  }
});

router.patch("/invites/:tripId", async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    // const token = req.cookies.token;
    const data = await tripService.updateInvite(req.user, tripId, req.body);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
