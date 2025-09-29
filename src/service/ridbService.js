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

module.exports = {
  getRecAreasByQuery,
};
