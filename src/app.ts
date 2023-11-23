import express from "express";
import { Db } from "mongodb";
import { getConnectedClient, getDb } from "./db";
import {
  BusGoHomeRoute,
  RouteContext,
  getBusStop,
  getNearbyBusStops,
  getBusServiceRating,
  submitBusServiceRating,
  getOppositeBusStops,
  getBusServiceStops,
  getJourney,
} from "./routes";

const passOnErrors =
  (route: BusGoHomeRoute, ctx: RouteContext): express.RequestHandler =>
  async (req, res, next) => {
    // Ensure errors raised in asynchronous request handlers are passed
    // to the Express error middleware.
    try {
      await route(ctx)(req, res, next);
    } catch (e) {
      next(e);
    }
  };

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  console.debug(`Internal server error: ${err && err.stack ? err.stack : err}`);

  res.status(500).json({
    error: `Internal server error: ${err && err.stack ? err.stack : err}`,
  });
};

export const makeApp = async (db: Db): Promise<express.Express> => {
  const ctx: RouteContext = {
    db,
  };

  const app = express();

  app.use(express.json());

  app.get("/stops/:BusStopCode", passOnErrors(getBusStop, ctx));
  app.get(
    "/locations/:Longitude-:Latitude/nearbyStops",
    passOnErrors(getNearbyBusStops, ctx)
  );
  app.get("/roads/:RoadName/stops", passOnErrors(getOppositeBusStops, ctx));
  app.get(
    "/services/:ServiceNo-:Direction/stops",
    passOnErrors(getBusServiceStops, ctx)
  );
  app.get(
    "/services/:ServiceNo-:Direction/rating",
    passOnErrors(getBusServiceRating, ctx)
  );
  app.post(
    "/services/:ServiceNo-:Direction/rating",
    passOnErrors(submitBusServiceRating, ctx)
  );
  app.get(
    "/journeys/:OriginStopCode-:DestinationStopCode",
    passOnErrors(getJourney, ctx)
  );

  app.use(errorHandler);

  return app;
};

export const serveApp = async () => {
  const client = await getConnectedClient();
  const db = await getDb(client);

  const app = await makeApp(db);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

  const server = app.listen(port, "127.0.0.1", () => {
    console.debug(`SGBusGoHome listening on port ${port}`);
  });

  server.on("close", async () => {
    await db.dropDatabase();
    await client.close();
  });

  const onClose = () => {
    server.close();
  };

  process.on("SIGINT", onClose);
  process.on("SIGTERM", onClose);

  return server;
};
