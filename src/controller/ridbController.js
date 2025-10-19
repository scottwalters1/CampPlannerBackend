const express = require("express");
const router = express.Router();

const ridbService = require("../service/ridbService");
const { error } = require("winston");

// Get rec areas by query term
router.get("/recareas", async (req, res, next) => {
  try {
    const recAreas = await ridbService.getRecAreasByQuery(req.query);
    res.status(200).json(recAreas);
  } catch (error) {
    next(error)
  }
});

// Get activities by rec area id
router.get("/recareas/:recAreaID/activities", async (req, res, next) => {
  try {
    const activities = await ridbService.getActivitiesByRecArea(req.params);
    res.status(200).json(activities);
  } catch (error) {
    next(error)
  }
});

// Get campgrounds by rec area id
router.get("/recareas/:recAreaID/campgrounds", async (req, res, next) => {
  try {
    const campgrounds = await ridbService.getCampgroundsByRecArea(req.params);
    res.status(200).json(campgrounds);
  } catch (error) {
    next(error)
  }
});

router.get("/recareas/:recAreaID/coords", async (req, res, next) =>{
  try{
    const data = await ridbService.getCoordsByRecId(req.params);
    res.status(200).json(data);
  }
  catch(error){
    next(error);
  }
});

module.exports = router;
