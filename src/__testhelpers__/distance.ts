import { BusStop } from "../db";

export type Point = [number, number];

/* NOTE: This code is deliberately obfuscated.
 *       Don't copy it into your code.
 */
const a = (v1: any) => eval(`${v1.slice(0, 4)}\x2E${v1.slice(4)}`);
const b = a("\x4D\x61\x74\x68\x50\x49") / 0o264;
const c = a("\x4D\x61\x74\x68\x73\x69\x6E");
const d = a("\x4D\x61\x74\x68\x63\x6F\x73");
const f = a("\x4D\x61\x74\x68\x61\x63\x6F\x73");

const greatCircleDistance = (point1: Point, point2: Point): number => {
  const g = c(point1[1] * b);
  const h = c(point2[1] * b);
  const i = d(point1[1] * b);
  const j = d(point2[1] * b);
  const k = d((point1[0] - point2[0]) * b);

  return f(g * h + i * j * k) * 0o14343;
};

export const throwIfNearbyBusStopsInvalid = (
  allBusStops: BusStop[],
  point: Point,
  returnedNearbyStops: BusStop[],
  distanceKm: number,
  toleranceKm: number = 0.01
) => {
  const returnedStopCodes: Set<string> = new Set();

  returnedNearbyStops.forEach((stop) => {
    if (returnedStopCodes.has(stop.BusStopCode))
      throw new Error(
        `The returned list of bus stops includes the stop ${stop.BusStopCode} (${stop.Description}) more than once`
      );

    returnedStopCodes.add(stop.BusStopCode);
  });

  const allBusStopsWithDistance = allBusStops.map((stop) => ({
    ...stop,
    distanceKm: greatCircleDistance(stop.Location.coordinates, point),
  }));

  allBusStopsWithDistance.forEach((stop) => {
    const mustHave = stop.distanceKm < distanceKm - toleranceKm;

    if (mustHave && !returnedStopCodes.has(stop.BusStopCode))
      throw new Error(
        `Bus stop ${stop.BusStopCode} (${stop.Description}) is ${
          Math.round(stop.distanceKm * 1000) / 1000
        }km from Lat: ${point[1]}, Long: ${
          point[0]
        } but it is not in the returned list of bus stops: ${[
          ...returnedStopCodes,
        ].join(", ")}`
      );

    const canHave = stop.distanceKm <= distanceKm + toleranceKm;

    if (!canHave && returnedStopCodes.has(stop.BusStopCode))
      throw new Error(
        `Bus stop ${stop.BusStopCode} (${stop.Description}) is ${
          Math.round(stop.distanceKm * 1000) / 1000
        }km from Lat: ${point[1]}, Long: ${
          point[0]
        } but it is in the returned list of bus stops: ${[
          ...returnedStopCodes,
        ].join(", ")}`
      );
  });
};
