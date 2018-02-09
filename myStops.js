const MTA = require('mta-gtfs');
const mtaApiKey = require('./secrets').mtaApiKey;

/*
MTA feed documentation: http://datamine.mta.info/feed-documentation
List of MTA feeds: http://datamine.mta.info/list-of-feeds
MTA GTFS interface: https://github.com/aamaliaa/mta-gtfs
*/

// Set up clients. Is this really how I have to do this?
// 123456S
const IRTBroadwayLex = new MTA({
    key: mtaApiKey,
    feed_id: 1
});

// ACE
const IND8thAve = new MTA({
    key: mtaApiKey,
    feed_id: 26
})

// NQRW
const BMTBroadway = new MTA({
    key: mtaApiKey,
    feed_id: 16
})

// These are customized for me
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

module.exports = STOPS;
