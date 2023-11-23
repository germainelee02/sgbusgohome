import { Gaxios, GaxiosOptions } from "gaxios";
import { MongoClient } from "mongodb";

import { DB_URL, DB_NAME, busStops } from "../db";
import { serveApp } from "../app";

import Service33D2Stops from "./responses/getBusServiceStops-33-2.json";
import Service189D1Stops from "./responses/getBusServiceStops-189-1.json";
import Service10eD2Stops from "./responses/getBusServiceStops-10e-2.json";

import StopsAlongTampinesAve5 from "./responses/stopsTampinesAve5.json";
import StopsAlongVictoriaSt from "./responses/stopsVictoriaSt.json";
import StopsAlongClementiRd from "./responses/stopsClementiRd.json";

import {
  throwIfNearbyBusStopsInvalid,
  Point,
} from "../__testhelpers__/distance";
import { submitManyRatings } from "../__testhelpers__/rating";
import { throwIfJourneyInvalid } from "../__testhelpers__/journey";
import { getNearbyBusStops } from "../routes";

const server = serveApp();
const mongo = new MongoClient(DB_URL);
const db = mongo.db(DB_NAME);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const gaxiosOptions: GaxiosOptions = {
  baseURL: `http://127.0.0.1:${port}`,
  timeout: 10000,
  validateStatus: () => true,
};
const gaxios = new Gaxios(gaxiosOptions);

beforeAll(async () => {
  await server;
  await mongo.connect();
});

describe("(Task 1) getBusServiceStops", () => {
  test("returns the stops for service 33, direction 2", async () => {
    const response = await gaxios.request({
      method: "GET",
      url: "/services/33-2/stops",
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(Service33D2Stops);
  });

  test("returns the stops for service 189, direction 1", async () => {
    const response = await gaxios.request({
      method: "GET",
      url: "/services/189-1/stops",
    });

    expect(response.status).toBe(200);
    console.log("received", response.data);
    console.log("expected", Service189D1Stops);
    expect(response.data).toMatchObject(Service189D1Stops);
  });

  test("returns the stops for service 10e, direction 2", async () => {
    const response = await gaxios.request({
      method: "GET",
      url: "/services/10e-2/stops",
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(Service10eD2Stops);
  });

  test("returns 404 for non-existent service 164, direction 1", async () => {
    const response = await gaxios.request({
      method: "GET",
      url: "/services/164-1/stops",
    });

    expect(response.status).toBe(404);
    expect(response.data).toMatchObject({ error: "Not found" });
  });

  test("returns 404 for service 36, non-existent direction 2", async () => {
    const response = await gaxios.request({
      method: "GET",
      url: "/services/36-2/stops",
    });

    expect(response.status).toBe(404);
    expect(response.data).toMatchObject({ error: "Not found" });
  });
});

describe("(Task 2) getNearbyBusStops", () => {
  test("returns bus stops nearby 103.90, 1.31", async () => {
    jest.setTimeout(30000);

    const allStops = await busStops(db).find().toArray();
    const point: Point = [103.9, 1.31];
    const distanceKm = 1.0;

    const response = await gaxios.request({
      method: "GET",
      url: "/locations/103.90-1.31/nearbyStops",
    });

    expect(response.status).toBe(200);

    throwIfNearbyBusStopsInvalid(allStops, point, response.data, distanceKm);
  });

  test("returns bus stops nearby 103.90, 1.31, maxDistance=2.0", async () => {
    const allStops = await busStops(db).find().toArray();
    const point: Point = [103.9, 1.31];
    const distanceKm = 2.0;

    const response = await gaxios.request({
      method: "GET",
      url: "/locations/103.90-1.31/nearbyStops?maxDistance=2.0",
    });

    expect(response.status).toBe(200);
    throwIfNearbyBusStopsInvalid(allStops, point, response.data, distanceKm);
  });

  test("returns bus stops nearby 103.90, 1.31, maxDistance=0.3", async () => {
    const allStops = await busStops(db).find().toArray();
    const point: Point = [103.9, 1.31];
    const distanceKm = 0.3;

    const response = await gaxios.request({
      method: "GET",
      url: "/locations/103.90-1.31/nearbyStops?maxDistance=0.3",
    });

    expect(response.status).toBe(200);
    throwIfNearbyBusStopsInvalid(allStops, point, response.data, distanceKm);
  });
});

// describe("(Task 3, Part 1) getBusServiceRating", () => {
//   test("returns correct BusServiceRating when there are no ratings", async () => {
//     const response = await gaxios.request({
//       method: "GET",
//       url: "/services/10e-1/rating",
//     });

//     expect(response.status).toBe(200);
//     expect(response.data).toMatchObject({
//       ServiceNo: "10e",
//       Direction: 1,
//       AvgRating: 0,
//       NumRatings: 0,
//     });
//   });

//   test("returns 404 for non-existent bus service 164, direction 1", async () => {
//     const response = await gaxios.request({
//       method: "GET",
//       url: "/services/164-1/rating",
//     });

//     expect(response.status).toBe(404);
//     expect(response.data).toMatchObject({ error: "Not found" });
//   });

//   test("returns rating statistics after ratings are submitted", async () => {
//     expect(
//       (
//         await gaxios.request({
//           method: "POST",
//           url: "/services/33-1/rating",
//           data: {
//             rating: 3,
//           },
//         })
//       ).status
//     ).toBe(204);

//     expect(
//       (
//         await gaxios.request({
//           method: "POST",
//           url: "/services/33-1/rating",
//           data: {
//             rating: 4,
//           },
//         })
//       ).status
//     ).toBe(204);

//     expect(
//       (
//         await gaxios.request({
//           method: "POST",
//           url: "/services/33-1/rating",
//           data: {
//             rating: 5,
//           },
//         })
//       ).status
//     ).toBe(204);

//     const response = await gaxios.request({
//       method: "GET",
//       url: "/services/33-1/rating",
//     });

//     expect(response.status).toBe(200);

//     expect(response.data).toMatchObject({
//       ServiceNo: "33",
//       Direction: 1,
//       NumRatings: 3,
//     });

//     expect(response.data.AvgRating).toBeCloseTo(4, 3);
//   });
// });

// describe("(Task 3, Part 2) submitBusServiceRating", () => {
//   test("returns 404 for non-existent bus service 164, direction 1", async () => {
//     const response = await gaxios.request({
//       method: "POST",
//       url: "/services/164-1/rating",
//       data: {
//         rating: 4,
//       },
//     });

//     expect(response.status).toBe(404);
//     expect(response.data).toMatchObject({ error: "Not found" });
//   });

//   test("returns 400 when no rating is specified", async () => {
//     const response = await gaxios.request({
//       method: "POST",
//       url: "/services/35-1/rating",
//       data: {},
//     });

//     expect(response.status).toBe(400);
//     expect(response.data).toMatchObject({ error: "Invalid rating" });
//   });

//   test("returns 400 when rating is a string", async () => {
//     const response = await gaxios.request({
//       method: "POST",
//       url: "/services/35-1/rating",
//       data: {
//         rating: "hello",
//       },
//     });

//     expect(response.status).toBe(400);
//     expect(response.data).toMatchObject({ error: "Invalid rating" });
//   });

//   test("returns 400 when rating is less than 0", async () => {
//     const response = await gaxios.request({
//       method: "POST",
//       url: "/services/35-1/rating",
//       data: {
//         rating: -1,
//       },
//     });

//     expect(response.status).toBe(400);
//     expect(response.data).toMatchObject({ error: "Invalid rating" });
//   });

//   test("returns 400 when rating is greater than 5", async () => {
//     const response = await gaxios.request({
//       method: "POST",
//       url: "/services/35-1/rating",
//       data: {
//         rating: 5.5,
//       },
//     });

//     expect(response.status).toBe(400);
//     expect(response.data).toMatchObject({ error: "Invalid rating" });
//   });

//   test("returns 204 with empty body after updating rating statistics", async () => {
//     const response = await gaxios.request({
//       method: "POST",
//       url: "/services/36-1/rating",
//       data: {
//         rating: 3,
//       },
//     });

//     expect(response.status).toBe(204);
//     expect(response.data).toBe("");
//   });

//   test("updates rating statistics atomically", async () => {
//     const { AvgRating: expectedAvgRating, ...expectedRating } =
//       await submitManyRatings("143", 2, 200);

//     const actualRating = await gaxios.request({
//       method: "GET",
//       url: "/services/143-2/rating",
//     });

//     expect(actualRating.status).toBe(200);
//     expect(actualRating.data).toMatchObject(expectedRating);

//     expect(actualRating.data.AvgRating).toBeCloseTo(expectedAvgRating, 3);
//   });
// });

// describe("(Task 4) getOppositeBusStops", () => {
//   test("returns bus stops along Tampines Ave 5", async () => {
//     const response = await gaxios.request({
//       method: "GET",
//       url: "/roads/Tampines Ave 5/stops",
//     });

//     expect(response.status).toBe(200);
//     expect(response.data).toMatchObject(StopsAlongTampinesAve5);
//   });

//   test("returns bus stops along Victoria St", async () => {
//     const response = await gaxios.request({
//       method: "GET",
//       url: "/roads/Victoria St/stops",
//     });

//     expect(response.status).toBe(200);
//     expect(response.data).toMatchObject(StopsAlongVictoriaSt);
//   });

//   test("returns bus stops along Clementi Rd", async () => {
//     const response = await gaxios.request({
//       method: "GET",
//       url: "/roads/Clementi Rd/stops",
//     });

//     expect(response.status).toBe(200);
//     expect(response.data).toMatchObject(StopsAlongClementiRd);
//   });

//   test("returns 404 for non-existent road Bartley Rd West", async () => {
//     const response = await gaxios.request({
//       method: "GET",
//       url: "/roads/Bartley Rd West/stops",
//     });

//     expect(response.status).toBe(404);
//     expect(response.data).toMatchObject({ error: "Not found" });
//   });
// });

// describe("(Task 5) getJourney", () => {
//   [
//     { Origin: "95099", Destination: "16171", ScenicMode: false },
//     { Origin: "95099", Destination: "16171", ScenicMode: true },
//     { Origin: "92049", Destination: "49199", ScenicMode: false },
//     { Origin: "16149", Destination: "21309", ScenicMode: false },
//     { Origin: "44389", Destination: "56011", ScenicMode: false },
//     { Origin: "44389", Destination: "56011", ScenicMode: true },
//   ].forEach(({ Origin, Destination, ScenicMode }) => {
//     test(`finds a journey from ${Origin} to ${Destination}, scenic=${ScenicMode}`, async () => {
//       const originStop = await busStops(db).findOne({
//         BusStopCode: Origin,
//       });
//       const destinationStop = await busStops(db).findOne({
//         BusStopCode: Destination,
//       });

//       if (!originStop || !destinationStop)
//         throw new Error("Unable to find origin and/or destination bus stops");

//       const { Description: OriginDescription } = originStop;
//       const { Description: DestinationDescription } = destinationStop;

//       const journeyHeader = `${Origin} (${OriginDescription}) and ${Destination} (${DestinationDescription}), scenic=${ScenicMode}`;

//       const response = await gaxios.request({
//         method: "GET",
//         url: `/journeys/${Origin}-${Destination}?scenic=${
//           ScenicMode ? "truth" : "false"
//         }`,
//       });

//       expect(response.status).toBe(200);

//       try {
//         // First validate the repsonse types
//         expect(typeof response.data.estimatedTime).toBe("number");
//         expect(Array.isArray(response.data.segments)).toBe(true);

//         response.data.segments.forEach((segment: any) => {
//           expect(typeof segment.ServiceNo).toBe("string");
//           expect(typeof segment.Direction).toBe("number");
//           expect(typeof segment.OriginCode).toBe("string");
//           expect(typeof segment.DestinationCode).toBe("string");
//         });

//         await throwIfJourneyInvalid(db, Origin, Destination, response.data);

//         console.debug(
//           `Journey from ${journeyHeader}: ${
//             response.data.estimatedTime
//           } minutes, ${response.data.segments.length - 1} transfers`
//         );
//       } catch (e) {
//         console.debug(
//           `Received the following invalid response for journey from ${journeyHeader}: \n\n${JSON.stringify(
//             response.data,
//             null,
//             2
//           )}`
//         );
//         throw e;
//       }
//     });
//   });
// });

afterAll(async () => {
  await mongo.close();
  (await server).close();
});
