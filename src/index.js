/**
 * @fileoverview Creates 2 Redis indices on the Chinook data set.  This code is called from start.sh via npm run index.
 */

import { createClient, SchemaFieldTypes  } from 'redis';
import { GENRE_INDEX, TRACK_INDEX } from './names.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));  //'sleep' function (in ms)
const pctFunc = (elm) => elm === 'percent_indexed';  // function for parsing percent_indexed from ft.info

/**
 * Function to poll and sleep until an index is built.
 * @param {object} redis - Redis client
 * @param {string} index - Index name
 */
async function poll(redis, index) {
    let pctIndexed = 0;
    let res;
    while (pctIndexed < 1) {
        await sleep(100);
        res = await redis.sendCommand(['ft.info', index]);
        pctIndexed = res[res.findIndex(pctFunc)+1];
    }
}

(async () => {
    const redis = createClient({url: `redis://default:redis@localhost:12000`});
    await redis.connect();
    try { 
        await redis.ft.create(GENRE_INDEX, {
            '$.NAME': {
                type: SchemaFieldTypes.TAG,
                AS: 'name'
            }
            },{ ON: 'JSON', PREFIX: 'genre:' }
        );
        await poll(redis, GENRE_INDEX);
    }
    catch (err) {
        if (err.message !== 'Index already exists') {
            console.error(err);
            process.exit(1);
        }    
    } 
    
    try {
        await redis.ft.create(TRACK_INDEX, {
            '$.GENREID': {
                type: SchemaFieldTypes.NUMERIC,
                AS: 'genreId'
            }
            },{ ON: 'JSON', PREFIX: 'track:' }
        ); 
        await poll(redis, TRACK_INDEX);
    }
    catch (err) {
        if (err.message !== 'Index already exists') {
            console.error(err);
            process.exit(1);
        }
    }
    await redis.disconnect(); 
})();