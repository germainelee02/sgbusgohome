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
  rank?: number;
};

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

    // query 1: getting all the bus stop codes along the given route.
    const selectedBusRoutes = busRoutes(db).find(
      {
        ServiceNo,
        Direction: Number(Direction),
      },
      { projection: { _id: 0, BusStopCode: 1, Direction: 1, StopSequence: 1 } }
    );

    const busCodeToRank: { [index: string]: number[] } = {};
    const selectedBusStopCodes = [];

    /*
    constructing a key-value pair such that:
      - the key is the bus stop code
      - the value is an array of all its stop sequences
     */
    for await (const doc of selectedBusRoutes) {
      if (!busCodeToRank[doc.BusStopCode]) {
        busCodeToRank[doc.BusStopCode] = [];
        selectedBusStopCodes.push(doc.BusStopCode);
      }
      busCodeToRank[doc.BusStopCode].push(doc.StopSequence);
    }
    if (selectedBusStopCodes.length == 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    // query 2: getting all the bus stop objects in the bus route
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
      const ranks = busCodeToRank[doc.BusStopCode];

      // for each time the bus stop has a stop sequence, we append it to our busStopArr
      for (let i = 0; i < ranks.length; i++) {
        const rank = ranks[i];
        busStopArr.push({ ...doc, rank });
      }
    }

    // sorting the bus stops by their stop sequences (rank)
    busStopArr.sort((firstElem: any, secondElem: any) => {
      return firstElem.rank - secondElem.rank;
    });

    // removing the stop sequence from the bus stop object
    for (let i = 0; i < busStopArr.length; i++) {
      const obj: BusStopSchema = busStopArr[i];
      delete obj.rank;
    }

    return res.status(200).json(busStopArr);
  };

export const getNearbyBusStops: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { Latitude, Longitude } = req.params;

    // Task 2: Implement a Route to Find Nearby Bus Stops
    // TODO: Your implementation here.

    res.status(500).json({ error: "Not implemented" });
  };

export const getBusServiceRating: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { ServiceNo, Direction } = req.params;

    // Task 3, Part 1: Implement a Route to Retrieve Rating Statistics
    //                 for a Bus Service
    // TODO: Your implementation here.

    res.status(500).json({ error: "Not implemented" });
  };

export const submitBusServiceRating: BusGoHomeRoute =
  ({ db }) =>
  async (req, res) => {
    const { ServiceNo, Direction } = req.params;

    // Task 3, Part 2: Implement a Route to Submit a Rating for a Bus Service
    // TODO: Your implementation here.

    res.status(500).json({ error: "Not implemented" });
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
