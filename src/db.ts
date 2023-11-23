import { MongoClient, Collection, Db } from "mongodb";
import BusStops from "./BusStops.json";
import BusServices from "./BusServices.json";
import BusRoutes from "./BusRoutes.json";

export interface BusStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Location: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface BusService {
  ServiceNo: string;
  Operator: string;
  Direction: number;
  Category: string;
  OriginCode: string;
  DestinationCode: string;
  LoopDesc: string;
}

export interface BusServiceRating {
  ServiceNo: string;
  Direction: number;
  AvgRating: number;
  NumRatings: number;
}

export interface BusRoute {
  ServiceNo: string;
  Operator: string;
  Direction: number;
  StopSequence: number;
  BusStopCode: string;
  Distance: number;
}

export const DB_URL =
  process.env.BUSGOHOME_DB_URL || "mongodb://127.0.0.1:27017";
export const DB_NAME = process.env.BUSGOHOME_DB_NAME || "busgohome";

export const getConnectedClient = (): Promise<MongoClient> =>
  new MongoClient(DB_URL).connect();

export const busStops = (db: Db): Collection<BusStop> =>
  db.collection("busStops");

export const busServices = (db: Db): Collection<BusService> =>
  db.collection("busServices");

export const busServiceRatings = (db: Db): Collection<BusServiceRating> =>
  db.collection("busServiceRatings");

export const busRoutes = (db: Db): Collection<BusRoute> =>
  db.collection("busRoutes");

export const getDb = async (client: MongoClient): Promise<Db> => {
  const db = client.db(DB_NAME);

  await db.dropDatabase();

  await busStops(db).insertMany(
    BusStops.map(
      ({ BusStopCode, RoadName, Description, Latitude, Longitude }) => ({
        BusStopCode,
        RoadName,
        Description,
        Location: {
          type: "Point",
          coordinates: [Longitude, Latitude],
        },
      })
    )
  );

  await busStops(db).createIndex({ Location: "2dsphere" });

  await busServices(db).insertMany(
    BusServices.map(
      ({
        ServiceNo,
        Operator,
        Direction,
        Category,
        OriginCode,
        DestinationCode,
        LoopDesc,
      }) => ({
        ServiceNo,
        Operator,
        Direction,
        Category,
        OriginCode,
        DestinationCode,
        LoopDesc,
      })
    )
  );

  await busServices(db).createIndex({ ServiceNo: 1, Direction: 1 });

  await busRoutes(db).insertMany(
    BusRoutes.map(
      ({
        ServiceNo,
        Operator,
        Direction,
        StopSequence,
        BusStopCode,
        Distance,
      }) => ({
        ServiceNo,
        Operator,
        Direction,
        StopSequence,
        BusStopCode,
        Distance,
      })
    )
  );

  await busRoutes(db).createIndex({
    ServiceNo: 1,
    Direction: 1,
    StopSequence: 1,
  });

  await busServiceRatings(db).createIndex(
    { ServiceNo: 1, Direction: 1 },
    { unique: true }
  );

  return db;
};
