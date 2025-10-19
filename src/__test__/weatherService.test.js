const weatherService = require("../service/weatherService");
const { logger } = require("../util/logger");
const { AppError } = require("../util/appError");

jest.mock("../util/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn(); // mock fetch globally
});

describe("weatherService tests", () => {
  describe("getWeatherByQuery tests", () => {
    const mockParams = {
      latitude: "37.8651",
      longitude: "-119.5383",
      start_date: "2025-10-18",
      end_date: "2025-10-20",
    };

    test("should return formatted weather data", async () => {
      const mockData = {
        daily: {
          time: ["2025-10-18", "2025-10-19", "2025-10-20"],
          temperature_2m_max: [20, 22, 21],
          temperature_2m_min: [10, 12, 11],
          windspeed_10m_max: [5, 7, 6],
          precipitation_sum: [0, 1, 0.5],
          weathercode: [1, 2, 3],
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await weatherService.getWeatherByQuery(mockParams);

      expect(result).toEqual([
        {
          date: "2025-10-18",
          temperature_max: 20,
          temperature_min: 10,
          windspeed: 5,
          precipitation: 0,
          weathercode: 1,
        },
        {
          date: "2025-10-19",
          temperature_max: 22,
          temperature_min: 12,
          windspeed: 7,
          precipitation: 1,
          weathercode: 2,
        },
        {
          date: "2025-10-20",
          temperature_max: 21,
          temperature_min: 11,
          windspeed: 6,
          precipitation: 0.5,
          weathercode: 3,
        },
      ]);

      expect(logger.info).toHaveBeenCalledWith(
        "Fetching weather from:",
        expect.stringContaining("latitude=37.8651")
      );
    });

    test("should throw AppError if fetch returns non-ok", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Bad Request",
      });

      await expect(weatherService.getWeatherByQuery(mockParams)).rejects.toThrow(
        "Weather error"
      );

      expect(logger.error).toHaveBeenCalledWith("Weather error", "Bad Request");
    });

    test("should handle missing optional fields gracefully", async () => {
      const mockData = {
        daily: {
          time: ["2025-10-18"],
          temperature_2m_max: [20],
          temperature_2m_min: [10],
          // windspeed_10m_max, precipitation_sum, weathercode are missing
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await weatherService.getWeatherByQuery(mockParams);

      expect(result).toEqual([
        {
          date: "2025-10-18",
          temperature_max: 20,
          temperature_min: 10,
          windspeed: null,
          precipitation: null,
          weathercode: null,
        },
      ]);
    });
  });
});