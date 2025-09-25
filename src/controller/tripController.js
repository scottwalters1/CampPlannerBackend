const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');

const tripService = require("../service/tripService");
const { logger } = require('../util/logger');

router.get("/", async (req, res) => {
    res.status(200).json({message: "Trips"});
})

router.get("/:recAreaName", async (req, res) => {
    const recAreaName = req.params.recAreaName;
    const data = await tripService.getRecAreaByName(recAreaName);
    if (data) {
        res.status(201).json(data);
    } else {
        res.status(400).json({message: "Error"});
    }
})

router.post("/trips", async (req, res) => {
    const data = await ticketService.postTrip(req.user, req.body);
    if (data) {
        res.status(201).json({message: `Trip created.`});
    } else {
        res.status(400).json({message: data});
    }
});

router.put("/trips", async (req, res) => {
    const data = await ticketService.updateTrip();
});

router.delete("/trips", async (req, res) => {
    const data = await ticketService.deleteTrip();
});

module.exports = router;