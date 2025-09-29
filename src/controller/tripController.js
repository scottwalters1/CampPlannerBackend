const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const tripService = require("../service/tripService");
const { logger } = require("../util/logger");

// createTripDate
router.post("/:tripId", async (req, res) => {
  const tripId = req.params.tripId;
  const data = await tripService.createTripDate({ ...req.body, tripId });
  if (data) {
    res.status(201).json(data);
  } else {
    res.status(400).json({ message: "Error" });
  }
});

// createTrip
router.post("/", async (req, res) => {
  const data = await tripService.createTrip(req.body);
  if (data) {
    res.status(201).json(data);
  } else {
    res.status(400).json({ message: "Error" });
  }
});

// getTripsByUsername
// TODO: change to get username from logged in user
router.get("/user/:username", async (req, res) => {
  const username = req.params.username;
  console.log("username: ", username);
  const trips = await tripService.getTripsByUsername(username);

  if (trips && trips.length > 0) {
    res.status(200).json(trips);
  } else {
    res.status(404).json({ message: "No trips found for this user" });
  }
});

// router.get("/", async (req, res) => {
//     res.status(200).json({message: "Trips"});
// })

// router.get("/:recAreaName", async (req, res) => {
//     const recAreaName = req.params.recAreaName;
//     const data = await tripService.getRecAreaByName(recAreaName);
//     if (data) {
//         res.status(201).json(data);
//     } else {
//         res.status(400).json({message: "Error"});
//     }
// })

// router.put("/trips", async (req, res) => {
//     const data = await ticketService.updateTrip();
// });

// router.delete("/trips", async (req, res) => {
//     const data = await ticketService.deleteTrip();
// });

module.exports = router;
