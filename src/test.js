/**
 * @fileoverview Test script using node-redis client.  Tests the identical functionality implemented in the 
 * Gears function - artist.js
 */

import { createClient } from 'redis';
import { GENRE_INDEX, TRACK_INDEX } from './names.js';

/**
 * Function that executes a Redis Search for a genre id given the genre name.
 * @param {object} redis - Redis client
 * @param {string} name - Genre name
 * @returns {string} genre id
 */
async function getGenreId(redis, name) {
    const res = await redis.ft.search(GENRE_INDEX, `@name:{${name}}`, { RETURN: '$.GENREID'})
    if (res.documents.length > 0 && '$.GENREID' in res.documents[0].value) {
        return res.documents[0].value['$.GENREID'];
    }
    else {
        console.error(`Genre ${name} does not exist`);
        process.exit(1);
    }
}

/**
 * Function that executes a Redis aggregation with cursor to find all the album ids associated with a given
 * genre id.
 * @param {object} redis - Redis client
 * @param {number} genreId - Genre id
 * @returns {number[]} array of album ids
 */
async function getAlbumIds(redis,genreId) {  
    let albumIds = [];
    let res = await redis.ft.aggregateWithCursor(TRACK_INDEX, `'@genreId:[${genreId} ${genreId}]'`, {
        LOAD: [{ identifier: '$.ALBUMID', AS: 'albumId'}],
        COUNT: 2000
    });
    while (true) {
        for (const result of res.results) {
            albumIds.push(result.albumId)
        } 
        if (!res.cursor) {
            break;
        }
        else {
            res = await redis.ft.cursorRead('trackIdx', res.cursor)
        }
    }
    return albumIds;
}

/**
 * Function the fetches all tracks for given array of albumIds.  Aggregates a song count for each artist
 * and then returns a configurable number of artists, ordered by descending song count.
 * @param {object} redis - Redis client
 * @param {number[]} albumIds - Array of album Ids
 * @param {number} size - number JSON records to return
 * @returns {Object[]} JSON array of artist names and associated song counts
 */
async function getResults(redis, albumIds, size) {
    let results = [];
    let ids = new Map();
    
    for (let albumId of albumIds) {
        let artistId = ids.get(albumId);
        if (!artistId) { 
            artistId = (await redis.json.get(`album:ALBUMID:${albumId}`, { path: '$.ARTISTID' }))[0]; 
            ids.set(albumId, artistId);
        }        
        const idx = results.findIndex((elm) => elm.ARTISTID == artistId);
        if (idx < 0) {
            const artistName = (await redis.json.get(`artist:ARTISTID:${artistId}`, { path: '$.NAME' }))[0];
            results.push({ ARTISTID: artistId, NAME: artistName, SONGS: 1 });
        }
        else {
            results[idx].SONGS++;
        }
    } 
    return results.sort((a, b) => b.SONGS - a.SONGS).slice(0, size);
}

(async () => {
    const redis = createClient({url: `redis://default:redis@localhost:12000`});
    await redis.connect();
    const genre = 'Rock';
    const size = 10;
    const genreId = await getGenreId(redis, genre);
    if (!genreId) {
        console.error(`Error: Genre ID not found for ${genre}`);
        process.exit(1);
    }
    const albumIds = await getAlbumIds(redis, genreId);
    const results = await getResults(redis, albumIds, size);
    console.log(JSON.stringify(results, undefined, 4));
    await redis.disconnect();
})();