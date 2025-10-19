const { AppError } = require("../util/appError");
const { logger } = require("../util/logger");

const RIDB_BASE_URL = "https://ridb.recreation.gov/api/v1";
const RIDB_API_KEY = process.env.RIDB_API_KEY;

async function getRecAreasByQuery(query) {
  // Extract query params
  const searchParams = {
    query: query.query,
    limit: query.limit ? parseInt(query.limit) : 50,
  };

  // Build URL + execute fetch
  const queryString = new URLSearchParams(searchParams).toString();
  const url = `${RIDB_BASE_URL}/recareas?${queryString}`;
  const res = await fetch(url, {
    headers: { apikey: RIDB_API_KEY },
  });

  if (!res.ok) {
    logger.error("RIDB error");
    throw new AppError("RIDB error", 500);
  }

  const data = await res.json();

  // Return list of results
  return data.RECDATA.map((result) => ({
    RecAreaName: result.RecAreaName,
    RecAreaID: result.RecAreaID,
  }));
}

async function getActivitiesByRecArea(params) {
  const recAreaID = params.recAreaID;

  if (!recAreaID) {
    throw new AppError("recAreaID is required", 400);
  }

  const url = `${RIDB_BASE_URL}/recareas/${recAreaID}/activities`;

  let res;
  try {
    res = await fetch(url, {
      headers: { apikey: RIDB_API_KEY },
    });
  } catch (err) {
    logger.error("Failed to fetch from RIDB", err);
    throw new AppError("Failed to fetch from RIDB", 500);
  }

  const data = await res.json();

  return data.RECDATA.map((activity) => ({
    ActivityName: activity.ActivityName,
  }));
};

async function getCampgroundsByRecArea(params) {
  const recAreaID = params.recAreaID;

  if (!recAreaID) {
    throw new AppError("recAreaID is required", 400);
  }

  const url = `${RIDB_BASE_URL}/recareas/${recAreaID}/facilities`;

  let res;
  try {
    res = await fetch(url, {
      headers: { apikey: RIDB_API_KEY },
    });
  } catch (err) {
    logger.error("Failed to fetch from RIDB", err);
    throw new AppError("Failed to fetch from RIDB", 500);
  }

  const data = await res.json();

  const campgrounds = data.RECDATA.filter(
    (facility) => facility.FacilityTypeDescription === "Campground"
  );

  return campgrounds.map((campground) => ({
    FacilityName: campground.FacilityName,
    FacilityID: campground.FacilityID,
  }));
}

async function getCoordsByRecId(params) {
  try {
    const url = `${RIDB_BASE_URL}/recareas/${params.recAreaID}`;
    const res = await fetch(url, {
      headers: { apikey: RIDB_API_KEY },
    });

    if (!res.ok) throw new AppError("Failed to fetch rec area", 500);

    const data = await res.json();
    const { RecAreaLatitude, RecAreaLongitude } = data;

    return { latitude: RecAreaLatitude, longitude: RecAreaLongitude };
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

module.exports = {
  getRecAreasByQuery,
  getActivitiesByRecArea,
  getCampgroundsByRecArea,
  getCoordsByRecId,
};
