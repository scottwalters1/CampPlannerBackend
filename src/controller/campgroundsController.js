// const express = require('express');
// const { getCampgroundsByLocation } = require('../service/campgroundsService');
// const { logger } = require('../util/logger');

// const router = express.Router();

// // Get campgrounds with campsites by state
// // Query parameters:
// // - state: state code to filter by (optional)
// // - limit: maximum number of results (optional, default: 50)
// router.get('/', async (req, res) => {
//   try {
//     const locationParams = {
//       state: req.query.state || null,
//       limit: req.query.limit ? parseInt(req.query.limit) : 50
//     };

//     //fetch campgrounds with campsites by state
//     const campgrounds = await getCampgroundsByLocation(locationParams);

//     res.status(200).json({
//       count: campgrounds.length,
//       location: locationParams,
//       data: campgrounds
//     });
//   } catch (error) {
//     //error in fetching campgrounds with campsites by state
//     logger.error("Fetching campgrounds with campsites by state error:", error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch campgrounds with campsites by state',
//       message: error.message
//     });
//   }
// });

// module.exports = router;
