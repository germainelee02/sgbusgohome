# BusGoHome MongoDB Collections

## busStops

```typescript
interface BusStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Location: {
    type: "Point";
    coordinates: [number, number];
  };
}
```

A bus stop in Singapore

### Members

| Name                 | Type             | Description                                                                                 |
| --                   | --               | --                                                                                          |
| BusStopCode          | string           | A unique code identifying the bus stop<br/><br/>Example: `01012`                            |
| RoadName             | string           | The name of the road along which the bus stop is located<br/><br/>Example: `Victora St`     |
| Description          | string           | Description of the bus stop's location<br/><br/>Example: `Hotel Grand Pacific`              |
| Location             | object           | The location of the bus stop, as a GeoJSON object                                           |
| Location.type        | "Point"          | Type of the GeoJSON object                                                                  |
| Location.coordinates | [number, number] | Location of the bus stop in longitude, latitude format<br/><br/>Example: `103.8525, 1.2968` |

## busService

```typescript
interface BusService {
  ServiceNo: string;
  Operator: string;
  Direction: number;
  Category: string;
  OriginCode: string;
  DestinationCode: string;
  LoopDesc: string;
}
```

A bus service in Singapore

### Members

| Name            | Type   | Description                                                                                                                                                                                                                                                                                                                                                       |
| --              | --     | --                                                                                                                                                                                                                                                                                                                                                                |
| ServiceNo       | string | Number of the service<br/><br/>Example: `118`                                                                                                                                                                                                                                                                                                                     |
| Operator        | string | Operator of the bus service<br/><br/>Example: `GAS` (Go-Ahead Singapore)<br/><br/>You don't need to know the different operators to complete this assignment.                                                                                                                                                                                                     |
| Direction       | number | Direction number of the service<br/><br/>Bidirectional bus services have two `BusService` entries, e.g., `118-1` from Punggol Int to Changi Biz Park Ter and `118-2` from Changi Biz Park Ter to Punggol Int.<br/><br/>Looping services contain only one `BusService` entry with a `Direction` of `1`, e.g., `36-1`, Changi Airport PTB2 looping at Tomlinson Rd. |
| Category        | string | Category of the bus service<br/><br/>Example: `TRUNK`<br/><br/>You don't need to know the different bus route categories to complete this assignment.                                                                                                                                                                                                             |
| OriginCode      | string | Code of the first bus stop<br/><br/>Example: `65009` (Punggol Int)                                                                                                                                                                                                                                                                                                |
| DestinationCode | string | Code of the last bus stop<br/><br/>Example: `97009` (Changi Biz Park Ter)                                                                                                                                                                                                                                                                                         |
| LoopDesc        | string | Looping point of the bus service<br/><br/>For bidirectional services, `LoopDesc` is set to an empty string.                                                                                                                                                                                                                                                       |

## busServiceRating

```typescript
interface BusServiceRating {
  ServiceNo: string;
  Direction: number;
  AvgRating: number;
  NumRatings: number;
}
```

Rating for a bus service in Singapore

### Members

| Name       | Type   | Description                                                            |
| --         | --     | --                                                                     |
| ServiceNo  | string | Number of the service<br/><br/>Example: `118`                          |
| Direction  | number | Direction number of the bus service<br/><br/>Example: `1`              |
| AvgRating  | number | Average rating of the bus service, from 0-5<br/><br/>Example: `3.5`    |
| NumRatings | number | Number of ratings received for the bus service<br/><br/>Example: `326` |

## busRoutes

```typescript
interface BusRoute {
  ServiceNo: string;
  Operator: string;
  Direction: number;
  StopSequence: number;
  BusStopCode: string;
  Distance: number;
}
```

A bus stop along a bus service's route

### Members

| Name         | Type   | Description                                                                                          |
| --           | --     | --                                                                                                   |
| ServiceNo    | string | Number of the service<br/><br/>Example: `10`                                                         |
| Operator     | string | Operator of the bus service<br/><br/>Example: `SBST` (SBS Transit)                                   |
| Direction    | number | Direction number of the bus service<br/><br/>Example: `1`                                            |
| StopSequence | number | Position of the stop in the route sequence, starting from 0<br/><br/>Example: `0`                    |
| BusStopCode  | string | Code of the bus stop<br/><br/>Example: `75009` (Tampines Int)                                        |
| Distance     | number | Distance of the bus stop from the first bus stop of the service, in kilometers<br/><br/>Example: `0` |
