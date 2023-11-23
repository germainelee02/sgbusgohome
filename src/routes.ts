import { Db } from "mongodb";
import { RequestHandler } from "express";
import { busStops, busRoutes, busServices, busServiceRatings } from "./db";

export interface RouteContext {
  db: Db;
}

export type BusGoHomeRoute = (ctx: RouteContext) => RequestHandler;

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

    res.status(500).json({ error: "Not implemented" });
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
