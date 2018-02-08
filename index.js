const Alexa = require('alexa-sdk');
const MTA = require('mta-gtfs');
const TimeUtil = require('./timeUtil');
const mtaApiKey = require('./secrets').mtaApiKey;

/*
MTA feed documentation: http://datamine.mta.info/feed-documentation
List of MTA feeds: http://datamine.mta.info/list-of-feeds
MTA GTFS interface: https://github.com/aamaliaa/mta-gtfs

*/

// Set up clients. Is this really how I have to do this?
// 123456S
let IRTBroadwayLex = new MTA({
    key: mtaApiKey,
    feed_id: 1
});

// ACE
let IND8thAve = new MTA({
    key: mtaApiKey,
    feed_id: 26
})

// NQRW
let BMTBroadway = new MTA({
    key: mtaApiKey,
    feed_id: 16
})

const STOPS = {
    court: {
        id: 'R28',
        name: 'Court Street',
        caller: BMTBroadway
    },
    high: {
        id: 'A40',
        name: 'High Street',
        caller: IND8thAve
    },
    clark: {
        id: '231',
        name: 'Clark Street',
        caller: IRTBroadwayLex
    },
    borough23: {
        id: '232',
        name: 'Borough Hall (2/3)',
        caller: IRTBroadwayLex
    },
    borough45: {
        id: '423',
        name: 'Borough Hall (4/5)',
        caller: IRTBroadwayLex
    }
}

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

function handleStopError(error) {
    console.error(error);
}

getSchedule(STOPS.court);

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
