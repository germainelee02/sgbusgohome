import { Db } from "mongodb";
import { busRoutes, BusRoute } from "../db";

export interface JourneySegment {
  ServiceNo: string;
  Direction: number;
  OriginCode: string;
  DestinationCode: string;
}

export interface Journey {
  segments: JourneySegment[];
  estimatedTime: number;
}

const segmentToStr = (segment: JourneySegment): string => {
  const { ServiceNo, Direction, OriginCode, DestinationCode } = segment;

  return `${ServiceNo}-${Direction}, ${OriginCode} to ${DestinationCode}`;
};

const validateSegmentAndGetEstimatedTime = async (
  db: Db,
  origin: string,
  segment: JourneySegment
): Promise<number> => {
  const { ServiceNo, Direction, OriginCode, DestinationCode } = segment;

  if (OriginCode !== origin)
    throw new Error(
      `In segment ${segmentToStr(segment)}: Expected OriginCode to be ${origin}`
    );

  const routes = await await busRoutes(db)
    .find({
      ServiceNo,
      Direction,
      BusStopCode: { $in: [OriginCode, DestinationCode] },
    })
    .sort({ StopSequence: 1 })
    .toArray();

  const [originStop, destinationStop] = routes.reduce<
    [BusRoute | undefined, BusRoute | undefined]
  >(
    ([or, dest], route, idx) => {
      if (or && dest) return [or, dest];

      if (
        route.BusStopCode === OriginCode &&
        routes[idx + 1]?.BusStopCode === DestinationCode
      )
        return [route, routes[idx + 1]];

      if (route.BusStopCode === OriginCode) return [route, undefined];

      return [or, dest];
    },
    [undefined, undefined]
  );

  if (!originStop)
    throw new Error(
      `In segment ${segmentToStr(
        segment
      )}: One or both bus stops not in this service's route, or the route does not exist`
    );

  if (!destinationStop)
    throw new Error(
      `In segment ${segmentToStr(
        segment
      )}: Bus stop ${OriginCode} does not come before ${DestinationCode} in this service's route`
    );

  const distance = destinationStop.Distance - originStop.Distance;

  return (distance / 20) * 60;
};

export const throwIfJourneyInvalid = async (
  db: Db,
  origin: string,
  destination: string,
  journey: Journey,
  estimatedTimeToleranceMinutes: number = 1
) => {
  const { segments, estimatedTime } = journey;

  if (segments.length < 1)
    throw new Error("Journey does not have at least one segment");

  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  if (firstSegment.OriginCode !== origin)
    throw new Error(
      `In segment: ${segmentToStr(
        firstSegment
      )}: OriginCode of the first segment is not ${origin}`
    );

  if (lastSegment.DestinationCode !== destination)
    throw new Error(
      `In segment: ${segmentToStr(
        lastSegment
      )}: DestinationCode of the last segment is not ${destination}`
    );

  const estimatedSegmentTimes = await Promise.all(
    segments.map((segment, idx) => {
      const expectedOrigin =
        idx > 0 ? segments[idx - 1].DestinationCode : origin;

      return validateSegmentAndGetEstimatedTime(db, expectedOrigin, segment);
    })
  );

  const expectedEstimatedTime =
    estimatedSegmentTimes.reduce(
      (totalTime, segmentTime) => totalTime + segmentTime,
      0
    ) +
    (segments.length - 1) * 10;

  if (
    Math.abs(estimatedTime - expectedEstimatedTime) >
    estimatedTimeToleranceMinutes
  )
    throw new Error(
      `Expected estimated time for the given journey to be ${expectedEstimatedTime}, but received ${estimatedTime} instead`
    );
};
