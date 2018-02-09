const Alexa = require('alexa-sdk');
const myStops = require('./myStops');
const TimeUtil = require('./timeUtil');

/**
 * Calls the stop's feed to get the next arrivals
 * @param  {object} stop a stop object
 * @return {void}
 */
function getSchedule(stop) {
    // .schedule() apparently does not return the stop name
    // I could make another call for it but that's wasteful and time consuming
    let results = {
        stop: stop.name
    };

    stop.caller.schedule(stop.id)
        .then(handleStopData)
        .catch(handleStopError)
        .then((result) => {
            console.log(Object.assign(results, result));
        });
}

/**
 * Extracts the next three arrivals from the mta.stop() call
 * @param  {object} data object containing stop data
 * @return {object} object containing stop name and next three arrivals (north and south)
 */
function handleStopData(data) {
    let now = new Date();

    let results = {
        northbound: null,
        southbound: null
    };

    if (data && data.schedule) {
        let stopId = Object.keys(data.schedule)[0];

        let northboundArrivals = data.schedule[stopId].N;
        let southboundArrivals = data.schedule[stopId].S;

        results.northbound = getNextThreeArrivalsForSchedule(northboundArrivals, now);
        results.southbound = getNextThreeArrivalsForSchedule(southboundArrivals, now);
    }

    function getNextThreeArrivalsForSchedule(schedule, timeToCompare) {
        let result = [];
        let nextThree = schedule.slice(0, 3);

        for (let arrival of nextThree) {
            if (arrival.delay) {
                result.push('DELAY');
                break;
            }

            let minutesUntilArrival = TimeUtil.getDiffInMinutes(
                timeToCompare, new Date(arrival.arrivalTime * 1000)
            );

            result.push(minutesUntilArrival);
        }

        return result;
    }

    return results;
}

/**
 * Error callback for mta-gtfs
 * @param  {error} error error passed from mta-gtfs
 * @return {void}
 */
function handleStopError(error) {
    console.error(error);
}

getSchedule(myStops.high);

// Schedule response looks like this:
/*
{
  schedule: {
    <stopId>: {
      N: [{
        routeId: <train line>,
        delay: <who knows>
        arrivalTime: <timestamp>
        departureTime: <timestamp, should be the same as arrival time>
      }],
      S: {}
    }
  },
  updatedOn: <timestamp>
}
*/

// Test code for IRT lines
// One note about this, if the trains aren't running (like 2/3 on weekends) it will return {}
// IRTBroadwayLex.schedule(STOPS.clark.id).then((result) => {
//     console.log(result);
// });

// Get all stop info
// mta.stop().then((result) => { console.log(result) });

// Get overall subway status. probably useless
// mta.status('subway').then((result) => { console.log(result) });
