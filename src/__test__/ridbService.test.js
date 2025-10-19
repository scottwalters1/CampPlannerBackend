const ridbService = require("../service/ridbService");
const { logger } = require("../util/logger");
const { AppError } = require("../util/appError");

jest.mock("../util/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RIDB Service tests", () => {
  describe("getRecAreasByQuery tests", () => {
    test("should return formatted rec areas", async () => {
      const mockData = {
        RECDATA: [
          {
            RecAreaName: "Wrangell - St Elias National Park & Preserve",
            RecAreaID: "2986",
          },
          {
            RecAreaName: "Yosemite National Park",
            RecAreaID: "2991",
          },
          {
            RecAreaName: "Hensley Lake",
            RecAreaID: "481",
          },
          {
            RecAreaName: "Lee Vining Canyon Scenic Byway",
            RecAreaID: "13732",
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const query = { query: "Yosemite" };
      const result = await ridbService.getRecAreasByQuery(query);

      expect(result).toEqual([
        {
          RecAreaName: "Wrangell - St Elias National Park & Preserve",
          RecAreaID: "2986",
        },
        {
          RecAreaName: "Yosemite National Park",
          RecAreaID: "2991",
        },
        {
          RecAreaName: "Hensley Lake",
          RecAreaID: "481",
        },
        {
          RecAreaName: "Lee Vining Canyon Scenic Byway",
          RecAreaID: "13732",
        },
      ]);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/recareas?query=Yosemite"),
        expect.any(Object)
      );
    });

    test("should throw AppError if API returns non-ok", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(
        ridbService.getRecAreasByQuery({ query: "Yosemite" })
      ).rejects.toThrow("RIDB error");
      expect(logger.error).toHaveBeenCalledWith("RIDB error");
    });
  });

  describe("getActivitiesByRecArea tests", () => {
    test("should throw AppError if recAreaID missing", async () => {
      await expect(ridbService.getActivitiesByRecArea({})).rejects.toThrow(
        "recAreaID is required"
      );
    });

    test("should return formatted activities", async () => {
      const mockData = {
        RECDATA: [
          { ActivityName: "AUTO TOURING" },
          { ActivityName: "BIKING" },
          { ActivityName: "BOATING" },
          { ActivityName: "CLIMBING" },
          { ActivityName: "HISTORIC & CULTURAL SITE" },
          { ActivityName: "CAMPING" },
          { ActivityName: "FISHING" },
          { ActivityName: "HIKING" },
          { ActivityName: "HORSEBACK RIDING" },
          { ActivityName: "WILDLIFE VIEWING" },
          { ActivityName: "SNOWPARK" },
          { ActivityName: "PADDLING" },
          { ActivityName: "SWIMMING" },
        ],
      };

      fetch.mockResolvedValueOnce({ json: async () => mockData });

      const result = await ridbService.getActivitiesByRecArea({
        recAreaID: 2991,
      });

      expect(result).toEqual(
        mockData.RECDATA.map((a) => ({ ActivityName: a.ActivityName }))
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/recareas/2991/activities"),
        expect.any(Object)
      );
    });

    test("should throw AppError on fetch/network failure", async () => {
      fetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(
        ridbService.getActivitiesByRecArea({ recAreaID: 2991 })
      ).rejects.toThrow("Failed to fetch from RIDB");

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to fetch from RIDB",
        expect.any(Error)
      );
    });
  });

  describe("getCampgroundsByRecArea tests", () => {
    test("should return only campgrounds", async () => {
      const mockData = {
        RECDATA: [
          {
            FacilityName: "Camp A",
            FacilityID: 1,
            FacilityTypeDescription: "Campground",
          },
          {
            FacilityName: "Visitor Center",
            FacilityID: 2,
            FacilityTypeDescription: "Other",
          },
        ],
      };

      fetch.mockResolvedValueOnce({ json: async () => mockData });

      const result = await ridbService.getCampgroundsByRecArea({
        recAreaID: 2991,
      });
      expect(result).toEqual([{ FacilityName: "Camp A", FacilityID: 1 }]);
    });

    test("should throw AppError if recAreaID missing", async () => {
      await expect(ridbService.getCampgroundsByRecArea({})).rejects.toThrow(
        "recAreaID is required"
      );
    });

    test("should throw AppError on fetch/network failure", async () => {
      fetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(
        ridbService.getCampgroundsByRecArea({ recAreaID: 2991 })
      ).rejects.toThrow("Failed to fetch from RIDB");

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to fetch from RIDB",
        expect.any(Error)
      );
    });
  });

  describe("getCoordsByRecId tests", () => {
    test("should return coordinates", async () => {
      const mockData = {
        RecAreaLatitude: 37.8651,
        RecAreaLongitude: -119.5383,
      };

      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

      const result = await ridbService.getCoordsByRecId({ recAreaID: 2991 });
      expect(result).toEqual({ latitude: 37.8651, longitude: -119.5383 });
    });

    test("should throw error if fetch fails", async () => {
      fetch.mockResolvedValueOnce({ ok: false });

      await expect(
        ridbService.getCoordsByRecId({ recAreaID: 2991 })
      ).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
