import { Gaxios, GaxiosOptions } from "gaxios";

import { BusServiceRating } from "../db";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const gaxiosOptions: GaxiosOptions = {
  baseURL: `http://127.0.0.1:${port}`,
  timeout: 10000,
};
const gaxios = new Gaxios(gaxiosOptions);

const getRandomRatings = (numRatings: number): number[] =>
  Array(numRatings)
    .fill(0)
    .map(() => Math.floor(Math.random() * 500) / 100);

const mean = (ns: number[]): number => {
  if (ns.length < 1) return 0;

  const sum = ns.reduce((a, b) => a + b, 0);

  return sum / ns.length;
};

export const submitManyRatings = async (
  serviceNo: string,
  direction: number,
  numRatings: number
): Promise<BusServiceRating> => {
  const ratings = getRandomRatings(numRatings);

  const submissions = ratings.map((rating) =>
    gaxios.request({
      method: "POST",
      url: `/services/${serviceNo}-${direction}/rating`,
      data: {
        rating,
      },
    })
  );

  await Promise.all(submissions);

  return {
    ServiceNo: serviceNo,
    Direction: direction,
    AvgRating: mean(ratings),
    NumRatings: numRatings,
  };
};
