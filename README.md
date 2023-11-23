# BusGoHome: Take-Home Coding Assignment

Thank you for your interest in joining our company as a software
engineer. Completing this take-home coding assignment will help us
learn about your coding style and determine if you are suitable for
the role.

You should expect to spend around __2 hours__ working on this
assignment. Your solutions should demonstrate your ability to write
clean, but performant code with concepts and technologies we use
frequently:

- Typescript,
- MongoDB, and
- ExpressJS.

You should be able to complete the initial tasks quickly. The final task
is more open-ended, giving you a (hopefully) fun opportunity to showcase
your creativity as a software developer.

## Introduction

As a new employee, you need to figure out the most efficient way to
commute to the office from home. To save money, you decide to commute
by bus. To help you find the best bus route from home to the office,
you decide to build an application called SGBusGoHome. Your task for
this assignment is to complete some REST API routes for the backend of
SGBusGoHome. This backend is implemented as a Node ExpressJS
application written in Typescript, with data stored in a MongoDB
database.

### Rules

When completing this assignment, please adhere to the following rules:

1. You may refer to online sources, but you may not copy code
   verbatim. Acknowledge these sources where appropriate in code
   comments.

2. You may not install any additional NPM packages.

3. You may not download or rely on datasets other than the one
   provided.

4. **For Tasks 1-4 Only:** You may create additional source code
   files, but you may not write any additional initialization
   code. Your code must run only in the request handlers for the
   routes you must implement as described in the assignment tasks.
   
   For Task 5, you may add additional initialization code at your
   discretion.
   

## Getting Started

A scaffolding for the SGBusGoHome backend has already been implemented
for you. You need only modify the route functions present in
`src/routes.ts`.

Before you start coding, install the following dependencies:

- [NodeJS v12+](https://nodejs.org/en/download/)
- [MongoDB 4.2+](https://docs.mongodb.com/manual/installation/)

Then, install the package dependencies with NPM:

```bash
$ npm i
```

This assignment includes an automated test suite that will compile the
application,  populate MongoDB  with the  data described  in the  next
section, invoke your implemented routes,  and grade the correctness of
the results they return. To run the test suite:

```bash
$ npm test
```

Alternatively, you can start the SGBusGoHome REST API alone for your own
testing by running:

```bash
$ npm start
```

The API is accessible at `http://127.0.0.1:8080`.

If necessary, you may configure the following runtime parameters of
the test suite and standalone REST API server with environment
variables:

| Parameter             | Default Value               | Environment Variable to Set |
| --                    | --                          | --                          |
| MongoDB URL           | `mongodb://127.0.0.1:27017` | `BUSGOHOME_DB_URL`          |
| MongoDB Database Name | `busgohome`                 | `BUSGOHOME_DB_NAME`         |
| REST API Port         | `8080`                      | `PORT`                      |

## Dataset

SGBusGoHome has access to four MongoDB collections, defined in
`src/db.ts`. See the [dataset documentation](dataset.md) for more
information.

## Tasks

### Task 1: Implement a Route to Get Bus Stops by Service Number and Direction

Fill in an implementation of the `getBusServiceStops` function in
`src/routes.ts` to implement the following REST API method
specification.

You _must not_ use the MongoDB aggregation framework to complete this
task.

_Hint:_ You should be able to implement this route with only two
MongoDB queries.

#### busServices.getStops

Return the details of each bus stop along a bus service's route, in
order.

##### HTTP Request

`GET /services/{ServiceNo}-{Direction}/stops`

| Parameter Name | Type   | Description                     |
| --             | --     | --                              |
| ServiceNo      | string | Service number of the service   |
| Direction      | number | Direction number of the service |

##### Response Body

An array of `BusStop` objects, in the order of the requested bus
service's route.

##### Error Response

If the combination of service number and direction do not correspond
to an existing bus service, this method returns a 404 Not Found
response with the following JSON response body:

```
{"error": "Not found"}
```

##### Example Request and Response

```
GET /services/284-1/stops

[
  {
    "BusStopCode": "17009",
    "RoadName": "Clementi Ave 3",
    "Description": "Clementi Int",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.76412225438476,
        1.31491572870629
      ]
    }
  },
  {
    "BusStopCode": "17211",
    "RoadName": "Clementi Ave 4",
    "Description": "Bet Blks 315/318",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.7658972301256,
        1.31828806129678
      ]
    }
  },
  {
    "BusStopCode": "17201",
    "RoadName": "Clementi Ave 4",
    "Description": "Blk 308",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.76734890374861,
        1.32055715133061
      ]
    }
  },
  {
    "BusStopCode": "17219",
    "RoadName": "Clementi Ave 4",
    "Description": "Blk 376",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.76615861100824,
        1.31820000002277
      ]
    }
  },
  {
    "BusStopCode": "17009",
    "RoadName": "Clementi Ave 3",
    "Description": "Clementi Int",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.76412225438476,
        1.31491572870629
      ]
    }
  }
]
```

### Task 2: Implement a Route to Find Nearby Bus Stops

Fill in an implementation of the `getNearbyBusStops` function in
`src/routes.ts` to implement the following REST API method
specification.

Your implementation must:

1. Use the spherical law of cosines in the distance calculation and
   assume the radius of the earth is 6371km.

2. **Not** use a bare `find` on the `busStops` collection, i.e., you
   must perform some initial filtering using MongoDB.
   
3. **Not** use any of the following: `$expr` or any aggregation
   expression, `$near`, `$nearSphere`, or any other geospatial query
   operator.

_Hint:_ See http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
        
#### locations.getNearbyStops

Get a list of bus stops within the requested distance of a position
given in longitude, latitude coordinates.

##### HTTP Request

`GET /locations/{Longitude}-{Latitude}/nearbyStops?maxDistance={MaxDistance}`

| Parameter Name | Type              | Description                                                                                               |
| --             | --                | --                                                                                                        |
| Longitude      | number            | Longitude of the location                                                                                 |
| Latitude       | number            | Latitude of the location                                                                                  |
| MaxDistance    | (optional) number | Maximum distance of the search, in kilometers<br/><br/>If unspecified, assume a maximum distance of 1 km. |

##### Response Body

An array of `BusStop` objects. The order of the bus stops is
unimportant.

##### Example Request and Response

```
GET /locations/103.9003-1.309559/nearbyStops?maxDistance=0.3

[
  {
    "BusStopCode": "82131",
    "RoadName": "Dunman Rd",
    "Description": "Opp Maranatha Hall",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.90034889101835,
        1.30955979607535
      ]
    }
  },
  {
    "BusStopCode": "82139",
    "RoadName": "Dunman Rd",
    "Description": "Maranatha Hall",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.89936888898059,
        1.30938972202558
      ]
    }
  },
  {
    "BusStopCode": "82149",
    "RoadName": "Joo Chiat Rd",
    "Description": "Bef Koon Seng Rd",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.90136361120997,
        1.31101372476887
      ]
    }
  },
  {
    "BusStopCode": "82141",
    "RoadName": "Tembeling Rd",
    "Description": "Aft Koon Seng Rd",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.90248369965865,
        1.31084210669638
      ]
    }
  }
]
```

### Task 3: Implement Routes to Get and Post Bus Service Ratings

SGBusGoHome allows users to submit a rating from 1 to 5 for each bus
service, and to query the average and number of ratings for any bus
service.

#### Part 1: Implement a Route to Retrieve Rating Statistics for a Bus Service

Fill in an implementation of the `getBusServiceRating` function in
`src/routes.ts` to implement the following REST API method
specification.

##### busServices.getRating

Get the average and number of ratings for a bus service.

###### HTTP Request

`GET /services/{ServiceNo}-{Direction}/rating`

| Parameter Name | Type   | Description                     |
| --             | --     | --                              |
| ServiceNo      | string | Service number of the service   |
| Direction      | number | Direction number of the service |

###### Response Body

A `BusServiceRating` object.

If there are no ratings for the bus service, this method returns a
`BusServiceRating` object where `AvgRating` and `NumRatings` are both
0.

###### Error Response

If the combination of service number and direction do not correspond
to an existing bus service, this method returns a 404 Not Found
response with the following JSON response body:

```
{"error": "Not found"}
```

###### Example Request and Response

```
GET /services/135-1/rating

{
  "ServiceNo": "135",
  "Direction": 1,
  "AvgRating": 3.5,
  "NumRatings": 505
}
```

#### Part 2: Implement a Route to Submit a Rating for a Bus Service

Fill in an implementation of the `submitBusServiceRating` function in
`src/routes.ts` to implement the following REST API method
specification.

You need to create the `BusServiceRating` document for a bus service
if it does not already exist in the collection. If the document does
exist, you must update it atomically.

You **must not** use MonogDB transactions to implement this method.

_Hint_: Construct your `updateOne` query carefully to ensure
        atomiticity — consider using an optimistic update strategy, or
        using an aggregation pipeline for the update.
		
##### busServices.submitRating

Update the average and number of ratings for a bus service with a new
rating submission.

###### HTTP Request

`POST /services/{ServiceNo}-{Direction}/rating`

| Parameter Name | Type   | Description                     |
| --             | --     | --                              |
| ServiceNo      | string | Service number of the service   |
| Direction      | number | Direction number of the service |

The `Content-Type` header must be specified as `application/json`.

###### Request Body

```typescript
interface SubmitRatingRequest {
  rating: number;
}
```

| Member Name | Type   | Description                                                               |
| --          | --     | --                                                                        |
| rating      | number | New rating for the bus service<br/><br/>Must be a number between 0 and 5. |

###### Response

Upon success, this method returns a 204 No Content response with no
body.

###### Error Response

If the combination of service number and direction do not correspond
to an existing bus service, this method returns a 404 Not Found
response with the following JSON response body:

```
{"error": "Not found"}
```

Otherwise, if the request body does not contain a `rating` field whose
value is a number between 0 and 5, this method returns a 400 Bad Request
response with the following JSON response body:

```
{"error": "Invalid rating"}
```

###### Example Request

```
POST /services/135-1/rating

{
  "rating": 4.5
}
```

### Task 4: Implement a Route to List Pairs of Opposite Bus Stops

Fill in an implementation of the `getOppositeBusStops` function in `src/routes.ts`
to implement the following REST API method specification.

You must implement this route using a single MongoDB aggregation
query.

_Hint:_ Codes for opposite bus stop pairs differ only in their final
digit. One bus stop code will end with a `1`, while the opposing stop
in the pair will end with a `9` (e.g., `76051` (Our Tampines Hub) is
located opposite `76059` (Opp Our Tampines Hub) along Tampines Ave 5).

Some bus stop codes end in digits other than 1 and 9. These bus stops
have no opposite bus stop, and should be treated as existing in a
"pair" comprising only themselves.

#### roads.getOppositeBusStops

Get a list of opposite bus stop pairs along a road.

##### HTTP Request

`GET /roads/{RoadName}/stops`

| Parameter Name | Type   | Description             |
| --             | --     | --                      |
| RoadName       | string | Road name for the query |

##### Response Body

An array of `BusStop` objects. The bus stops should be sorted in:

1. Ascending order by the bus stop code of the highest-number bus stop
   in its opposing pair.
   
   _Example_: The bus stop code of the highest-numbered bus stop in the
   opposing pair for stops `76051` (Our Tampines Hub) and `76059` (Opp
   Our Tampines Hub) is `76059`.
   
2. If two bus stops belong to the same pair, the bus stop with the
   higher-number code should appear _before_ the bus stop with the
   lower-number code.
   
   _Example_: `76059` (Opp Our Tampines Hub) should appear before
   `76051` (Our Tampines Hub).

##### Error Response

If there are no bus stops along the given road, this method returns a 404 Not Found
response with the following JSON response body:

```
{"error": "Not found"}
```

##### Example Request and Response

```
GET /roads/Tampines Ave 5/stops

[
  {
    "BusStopCode": "75129",
    "RoadName": "Tampines Ave 5",
    "Description": "Darul Ghufran Mque",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.93936521711959,
        1.35563642049496
      ]
    }
  },
  {
    "BusStopCode": "75121",
    "RoadName": "Tampines Ave 5",
    "Description": "Opp Darul Ghufran Mque",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.93903255460283,
        1.35593392058986
      ]
    }
  },
  {
    "BusStopCode": "75139",
    "RoadName": "Tampines Ave 5",
    "Description": "Blk 863",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.93612503756641,
        1.35563964372785
      ]
    }
  },
  {
    "BusStopCode": "75131",
    "RoadName": "Tampines Ave 5",
    "Description": "Bet Blks 701/702",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.93709646027764,
        1.35594818346107
      ]
    }
  },
  {
    "BusStopCode": "75149",
    "RoadName": "Tampines Ave 5",
    "Description": "Blk 867A",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.93366388890493,
        1.35597194444127
      ]
    }
  },
  {
    "BusStopCode": "75141",
    "RoadName": "Tampines Ave 5",
    "Description": "Blk 730",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.93377888890949,
        1.35625000000112
      ]
    }
  },
  {
    "BusStopCode": "75179",
    "RoadName": "Tampines Ave 5",
    "Description": "Blk 871C",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.9317,
        1.357
      ]
    }
  },
  {
    "BusStopCode": "75171",
    "RoadName": "Tampines Ave 5",
    "Description": "UWCSEA",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.9313,
        1.3575
      ]
    }
  },
  {
    "BusStopCode": "76059",
    "RoadName": "Tampines Ave 5",
    "Description": "Opp Our Tampines Hub",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.94165154852797,
        1.35296163572491
      ]
    }
  },
  {
    "BusStopCode": "76051",
    "RoadName": "Tampines Ave 5",
    "Description": "Our Tampines Hub",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.9412639409046,
        1.35313809279079
      ]
    }
  },
  {
    "BusStopCode": "76069",
    "RoadName": "Tampines Ave 5",
    "Description": "Blk 147",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.94208629087403,
        1.34875342114003
      ]
    }
  },
  {
    "BusStopCode": "76061",
    "RoadName": "Tampines Ave 5",
    "Description": "Blk 938",
    "Location": {
      "type": "Point",
      "coordinates": [
        103.94189805552267,
        1.3482019444416
      ]
    }
  }
]
```

### Task 5: Implement a Route to Find a Path Between Two Bus Stops

Fill in an implementation of the `getJourney` function in
`src/routes.ts` to implement the following REST API method
specification.

_Hint:_ You may use the already-installed
[`ngraph.graph`](https://www.npmjs.com/package/ngraph.graph) and
[`ngraph.path`](https://www.npmjs.com/package/ngraph.path) NPM
packages, which provide fast implementations of several path-finding
algorithms.

#### journeys.get

Get an optimal routing between two bus stops.

This method does not perform an exhaustive search for an optimal
routing, but attempts to find the shortest, in terms of estimated
time, path between two bus stops using only public buses.

##### HTTP Request

`GET /journeys/{OriginStopCode}-{DestinationStopCode}?scenic={ScenicMode}`

| Parameter Name      | Type                         | Description                                                                                                                                                               |
| --                  | --                           | --                                                                                                                                                                        |
| OriginStopCode      | string                       | Bus stop code of the origin                                                                                                                                               |
| DestinationStopCode | string                       | Bus Stop code of the destination                                                                                                                                          |
| ScenicMode          | (optional) "true" \| "false" | Whether "scenic mode" is enabled<br/><br/>_(Bonus Task)_ If scenic mode is enabled, instead of optimizing for estimated time, optimize for the least number of transfers. |

##### Response Body

```typescript
interface JourneySegment {
  ServiceNo: string;
  Direction: number;
  OriginCode: string;
  DestinationCode: number;
}

interface Journey {
  segments: JourneySegment[];
  estimatedTime: number;
}
```

The response body for this method is a `Journey` object.

The `JourneySegment` objects in the `segments` array satisfy the
following properties:

1. The `OriginCode` of the first segment is always the given
   `OriginStopCode`,
2. The `DestinationCode` of the last segment is always the given
   `DestinationStopCode`, and
3. For any two consecutive segments, the `DestinationCode` of the
   first segment equals the `OriginCode` of the subsequent segment.

The estimated journey time is computed according to the following
rules:

1. The estimated speed of a public bus is 20 km/h, and
2. The estimated time of any transfer between bus services is 10
   minutes.

##### Error Response

If either the origin code or destination code do not correspond to an
existing bus stop, or there exists no journey between them, this
method returns a 404 Not Found response with the following JSON
response body:

```
{"error": "Not found"}
```

##### Example Request and Response

```
GET /journeys/95099-16171

{
  "segments": [
    {
      "ServiceNo": "89",
      "Direction": 1,
      "OriginCode": "95099", // Opp SAF Ferry Terminal
      "DestinationCode": "64009" // Hougang Ctrl Int
    },
    {
      "ServiceNo": "151",
      "Direction": 1,
      "OriginCode": "64009", // Hougang Ctrl Int
      "DestinationCode": "16171" // Yusof Ishak Hse
    }
  ],
  "estimatedTime": 140.5
}
```
