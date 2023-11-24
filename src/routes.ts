import { Db } from "mongodb";
import { RequestHandler } from "express";
import { busStops, busRoutes, busServices, busServiceRatings } from "./db";

export interface RouteContext {
  db: Db;
}

export type BusGoHomeRoute = (ctx: RouteContext) => RequestHandler;

type BusStopSchema = {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Location: {
    type: "Point";
    coordinates: [number, number];
  };
  stopSeq?: number;
};

enum HTTPResponse {
  NOT_FOUND = "Not found",
  INVALID_RATING = "Invalid rating",
}

// This route is included as an example.
export const getBusStop: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { BusStopCode } = req.params;

    const busStop = await busStops(db).findOne(
      { BusStopCode },
      { projection: { _id: 0 } }
    );

    if (!busStop) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    return res.status(200).json(busStop);
  };

export const getBusServiceStops: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { ServiceNo, Direction } = req.params;

    // Task 1: Implement a Route to Get Bus Stops by Service Number
    //         and Direction
    // TODO: Your implementation here.

    /**
     * QUERY 1: getting all the bus stop codes along the given route
     */
    const selectedBusRoutes = await busRoutes(db).find(
      {
        ServiceNo,
        Direction: Number(Direction),
      },
      { projection: { _id: 0, BusStopCode: 1, Direction: 1, StopSequence: 1 } }
    );

    const busCodeToStopSeqs: { [index: string]: number[] } = {};
    const selectedBusStopCodes = [];

    /**
     * constructing a key-value pair such that:
     *    - key --> bus stop code
     *    - value --> array of all its stop sequences
     */
    for await (const doc of selectedBusRoutes) {
      if (!busCodeToStopSeqs[doc.BusStopCode]) {
        busCodeToStopSeqs[doc.BusStopCode] = [];
        selectedBusStopCodes.push(doc.BusStopCode);
      }
      busCodeToStopSeqs[doc.BusStopCode].push(doc.StopSequence);
    }

    /**
     * if the size of the cursor is 0, then there is no existing bus service
     */
    if (selectedBusStopCodes.length == 0) {
      res.status(404).json({ error: HTTPResponse.NOT_FOUND });
      return;
    }

    /**
     * QUERY 2: getting all the bus stop objects in the bus route
     */
    const selectedBusStops = await busStops(db).find(
      {
        BusStopCode: { $in: selectedBusStopCodes },
      },
      {
        projection: { _id: 0 },
      }
    );

    const busStopArr = [];
    for await (const doc of selectedBusStops) {
      const stopSeqs = busCodeToStopSeqs[doc.BusStopCode];

      /**
       * for each time the bus stop has a stop sequence, we append it to our busStopArr.
       * we are adding the stopSeq field to our BusStopSchema for sorting later on.
       */
      for (let i = 0; i < stopSeqs.length; i++) {
        const stopSeq = stopSeqs[i];
        busStopArr.push({ ...doc, stopSeq });
      }
    }
    /**
     * sorting the bus stops by their stop sequence
     */
    busStopArr.sort((firstElem: BusStopSchema, secondElem: BusStopSchema) => {
      if (!firstElem.stopSeq || !secondElem.stopSeq) {
        return 1; // if there is no "stopSeq" field, then just sort normally
      }
      return firstElem.stopSeq - secondElem.stopSeq;
    });

    /**
     * (clean up) removing the stop sequence from the bus stop object
     */
    for (let i = 0; i < busStopArr.length; i++) {
      const obj: BusStopSchema = busStopArr[i];
      delete obj.stopSeq;
    }

    return res.status(200).json(busStopArr);
  };

export const getNearbyBusStops: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { Latitude, Longitude } = req.params;

    // Task 2: Implement a Route to Find Nearby Bus Stops
    // TODO: Your implementation here.

    /**
     * declaring constants
     */
    const MIN_LAT = -Math.PI / 2;
    const MAX_LAT = Math.PI / 2;
    const MAX_LON = Math.PI;
    const MIN_LON = -Math.PI;
    const TWO_PI = Math.PI * 2;
    const ONE_EIGHTY_DEG = 180.0;
    const EARTH_RADIUS = 6371.0;
    const DEFAULT_KM = "1.0";

    /**
     * declaring utility functions
     */
    const degreeToRadian = (degree: number): number => {
      return degree * (Math.PI / ONE_EIGHTY_DEG);
    };
    const radianToDegree = (radian: number): number => {
      return radian * (ONE_EIGHTY_DEG / Math.PI);
    };

    const { maxDistance } = req.query;
    const dist: string = (maxDistance as string) ?? DEFAULT_KM; // default value of 1.0km if maxDistance is not specified

    /**
     * referred to some of the source code from the website given:
     * http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
     */
    const radFraction = parseFloat(dist) / EARTH_RADIUS;
    const lat = degreeToRadian(Number(Latitude));
    const lon = degreeToRadian(Number(Longitude));
    let minLat = lat - radFraction;
    let maxLat = lat + radFraction;
    let minLon;
    let maxLon;
    let thetaLon;
    if (minLat > MIN_LAT && maxLat < MAX_LAT) {
      thetaLon = Math.asin(Math.sin(radFraction) / Math.cos(lat));
      minLon = lon - thetaLon;
      if (minLon < MIN_LON) {
        minLon += TWO_PI;
      }
      maxLon = lon + thetaLon;
      if (maxLon > MAX_LON) {
        maxLon -= TWO_PI;
      }
    } else {
      minLat = Math.max(minLat, MIN_LAT);
      maxLat = Math.min(maxLat, MAX_LAT);
      minLon = MIN_LON;
      maxLon = MAX_LON;
    }

    const minLonDeg = radianToDegree(minLon);
    const maxLonDeg = radianToDegree(maxLon);
    const minLatDeg = radianToDegree(minLat);
    const maxLatDeg = radianToDegree(maxLat);

    const lonCondition = {
      $and: [
        {
          "Location.coordinates.0": { $gte: minLonDeg },
        },
        {
          "Location.coordinates.0": { $lte: maxLonDeg },
        },
      ],
    };
    const latCondition = {
      $and: [
        {
          "Location.coordinates.1": { $gte: minLatDeg },
        },
        {
          "Location.coordinates.1": { $lte: maxLatDeg },
        },
      ],
    };

    const query = { $and: [latCondition, lonCondition] };
    const busStopsWithinRange = await busStops(db).find(query, {
      projection: { _id: 0 },
    });
    const ans = [];
    for await (const doc of busStopsWithinRange) {
      /**
       * additional check to account for rounding errors in the mongodb filtering
       */
      const condition =
        Math.acos(
          Math.sin(lat) *
            Math.sin(degreeToRadian(doc.Location.coordinates[1])) +
            Math.cos(lat) *
              Math.cos(degreeToRadian(doc.Location.coordinates[1])) *
              Math.cos(degreeToRadian(doc.Location.coordinates[0]) - lon)
        ) <= Number(radFraction);

      if (condition) {
        ans.push(doc);
      }
    }
    res.status(200).json(ans);
  };

export const getBusServiceRating: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { ServiceNo, Direction } = req.params;

    // Task 3, Part 1: Implement a Route to Retrieve Rating Statistics
    //                 for a Bus Service
    // TODO: Your implementation here.

    const selectedBusServices = await busServices(db).findOne(
      {
        ServiceNo,
        Direction: Number(Direction),
      },
      {
        projection: {
          _id: 0,
        },
      }
    );

    /**
     * if the bus service doenst exist, return 404
     */
    if (!selectedBusServices) {
      res.status(404).json({ error: HTTPResponse.NOT_FOUND });
      return;
    }

    /**
     * if the bus service exists but there is not rating, then insert an empty document
     */
    const selectedRatings = await busServiceRatings(db).findOneAndUpdate(
      {
        ServiceNo,
        Direction: Number(Direction),
      },

      {
        $setOnInsert: {
          AvgRating: 0,
          NumRatings: 0,
        },
      },

      {
        projection: {
          _id: 0,
        },
        upsert: true,
        returnDocument: "after",
      }
    );

    res.status(200).json(selectedRatings.value);
  };

export const submitBusServiceRating: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { ServiceNo, Direction } = req.params;

    // Task 3, Part 2: Implement a Route to Submit a Rating for a Bus Service
    // TODO: Your implementation here.
    const { rating } = req.body;

    const busServiceDoc = await busServices(db).findOne({
      ServiceNo,
      Direction: Number(Direction),
    });

    /**
     * if bus service doesn't exist, then return 404
     */
    if (!busServiceDoc) {
      res.status(404).json({ error: HTTPResponse.NOT_FOUND });
      return;
    }

    /**
     * if there is no rating, or is out of bounds, then return 400
     */
    if (!rating || !(rating >= 0 && rating <= 5)) {
      res.status(400).json({ error: HTTPResponse.INVALID_RATING });
      return;
    }
    await busServiceRatings(db).updateOne(
      {
        ServiceNo,
        Direction: Number(Direction),
      },

      [
        /**
         * this is following the formula:
         * AvgRating = (AvgRating * NumRatings + rating)/(NumRatings + 1)
         */
        {
          $set: {
            AvgRating: {
              $divide: [
                {
                  $add: [{ $multiply: ["$AvgRating", "$NumRatings"] }, rating],
                },
                { $add: ["$NumRatings", 1] },
              ],
            },
          },
        },
        /**
         * this is following the formula:
         * NumRatings = NumRatings + 1
         */
        {
          $set: {
            NumRatings: {
              $add: ["$NumRatings", 1],
            },
          },
        },
        /**
         * if the AvgRating/NumRatings is null, then the AvgRating = rating,
         * and NumRatings = 1.
         * if AvgRating/NumRatings is not null, then the operations above
         * have already carried out the calculation.
         */
        {
          $set: {
            AvgRating: {
              $cond: {
                if: { $eq: ["$AvgRating", null] },
                then: rating,
                else: "$AvgRating",
              },
            },
            NumRatings: {
              $cond: {
                if: { $eq: ["$NumRatings", null] },
                then: 1,
                else: "$NumRatings",
              },
            },
          },
        },
      ],
      { upsert: true }
    );
    res.status(204).json();
  };

export const getOppositeBusStops: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { RoadName } = req.params;

    // Task 4: Implement a Route to List Pairs of Opposite Bus Stops

    const stops = await busStops(db)
      .aggregate([
        // TODO: Your aggregation pipeline here
      ])
      .toArray();

    if (stops.length < 1) return res.status(404).json({ error: "Not found" });

    // res.status(200).json(stops);
    res.status(500).json({ error: "Not implemented" });
  };

export const getJourney: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { OriginStopCode, DestinationStopCode } = req.params;

    // Task 5: Implement a Route to Find a Path Between Two Bus Stops
    // TODO: Your implementation here

    res.status(500).json({ error: "Not implemented" });
  };
