const { AppError } = require("../util/appError");
const { logger } = require("../util/logger");

const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";

async function getWeatherByQuery({
  latitude,
  longitude,
  start_date,
  end_date,
}) {
  // Extract query params
  const searchParams = new URLSearchParams({
    latitude,
    longitude,
    start_date: start_date.trim(),
    end_date: end_date.trim(),
    daily:
      "temperature_2m_max,temperature_2m_min,windspeed_10m_max,precipitation_sum,weathercode",
  });
  // Build URL + execute fetch
  const url = `${WEATHER_BASE_URL}?${searchParams.toString()}`;
  const res = await fetch(url);
  logger.info("Fetching weather from:", url);

  if (!res.ok) {
    logger.error("Weather error", await res.text());
    throw new AppError("Weather error", 500);
  }

  const data = await res.json();

  // Return list of results
  const result = data.daily.time.map((date, idx) => ({
    date,
    temperature_max: data.daily.temperature_2m_max[idx],
    temperature_min: data.daily.temperature_2m_min[idx],
    windspeed: (data.daily.windspeed_10m_max || [])[idx] ?? null,
    precipitation: (data.daily.precipitation_sum || [])[idx] ?? null,
    weathercode: (data.daily.weathercode || [])[idx] ?? null,
  }));

  return result;
}

module.exports = { getWeatherByQuery };
