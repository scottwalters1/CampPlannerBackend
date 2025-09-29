const express = require("express");
const router = express.Router();

const ridbService = require("../service/ridbService");

// Get rec areas by query term
router.get("/recareas", async (req, res, next) => {
  try {
    const recAreas = await ridbService.getRecAreasByQuery(req.query);
    res.status(200).json(recAreas);
  } catch (error) {
    next(error)
  }
});

module.exports = router;
