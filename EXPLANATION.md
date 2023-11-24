# BusGoHome: Take-Home Coding Assignment

## Task 1

- I am querying for all the `BusStops` along my `BusRoutes`, using the filters `ServiceNo` and `Direction`.
- Then, I have a hashmap-like data structure `busCodeToRank`, which stores the bus code as the key, and an array of stop sequences as the value.
- If the array of `selectedBusStops` is empty, that means there is no existing bus service that corresponse to this service number and direction. Hence, return 404.
- Next, I query for all the `BusStops` that are inside the array `selectedBusStops`.
- In my array `busStopsArr`, I append all the objects `BusStopSchema`, while adding the stop sequence into it.
- I sort my array using `BusStopSchema.stopSeq`.
- Then, I delete the key `stopSeq` from my `BusStopSchema` object, and return the HTTP call.

## Task 2

- This was done after analysing the SQL statements in the hint provided, and translating them into MongoDB queries.
- Due to rounding errors, and conversion between radian to degree and vice versa, I found that only relying on MongoDB-side filtering would still fail the the edge cases.
- Hence, after obtaining the filtered results from MongoDB, I filtered once more using a loop, and only returned the documents that passed this filtering.

## Task 3 Part 1

- First, I query from BusService to check if the bus service exists for the corresponding service number and direction. If it does not exist, then return 404.
- Then, using `findOneAndUpdate`, I decided to upsert, initialising the fields `AvgRating` and `NumRatings` to 0, if the document did not previously exist.
- Finally, I returned the updated document.

## Task 3 Part 2

- Similarly to Task 3 Part 1, I query from BusService to check if the bus service exists for the corresponding service number and direction. If it does not exist, then return 404.
- If the rating does not exist for is not within bounds, then return 400.
- Then, I had to update the average ratings using the formulas `AvgRating = (AvgRating * NumRatings + rating)/(NumRatings + 1)` and `NumRatings = NumRatings + 1`.
- I used an aggregation pipeline with `updateOne`. I chose to do an upsert because the document may or may not exist previously. First, I performed the above calculations on the previous fields. If the document previously did not exist, an **insert** operations was done, and `AvgRating` and `NumRatings` would be `null`. Hence, after this step, I checked if the values were `null`. If they were, that meant that it was an **insert** operation, so I initialised those values accordingly. If `AvgRating` and `NumRatings` were not `null`, then it meant that it was an **update** operation, and in that case, I did not need to initalise anything.
