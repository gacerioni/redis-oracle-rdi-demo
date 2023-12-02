#!js api_version=1.0 name=artist
/**
 * @fileoverview Gears 2.0 function for emulating a 4-way SQL JOIN on normalized data.
 */

import { redis } from '@redis/gears-api';
import { GENRE_INDEX, TRACK_INDEX } from './names.js';

BigInt.prototype.toJSON = function() { return this.toString(); };  // hack to allow stringifying Redis responses

/**
 * Function that executes a Redis Search for a genre id given the genre name.
 * @param {object} asyncClient - Redis client
 * @param {string} name - Genre name
 * @returns {string} genre id
 */
async function getGenreId(asyncClient, name) {
    const cmd = `FT.SEARCH ${GENRE_INDEX} @name:{${name}} RETURN 3 $.GENREID AS genreId`;
    const response = await asyncClient.block((c) => {
        return c.callAsync(...cmd.split(' '));
    });
    if (response && response.results.length > 0) {
        result = response.results[0].extra_attributes.genreId;
    }
    return result;
}

/**
 * Function that executes a Redis aggregation with cursor to find all the album ids associated with a given
 * genre id.
 * @param {object} asyncClient - Redis client
 * @param {number} genreId - Genre id
 * @returns {number[]} array of album ids
 */
async function getAlbumIds(asyncClient, genreId) {
    let albumIds = [];
    let cmd = ['FT.AGGREGATE', TRACK_INDEX, `'@genreId:[${genreId} ${genreId}]'`, 'LOAD', '3', 
        '$.ALBUMID', 'AS', 'albumId', 'WITHCURSOR', 'COUNT', '10'];
    let response = await asyncClient.block((c) => {
        return c.callAsync(...cmd);
    });
    
    let cursor;
    while (true) {
        if (response && response.length > 1) {
            for (let result of response[0].results) {
                albumIds.push(result.extra_attributes.albumId);
            }
            cursor = response[1];
            if (!cursor) {
                break;
            }
            else {
                cmd = `FT.CURSOR READ ${TRACK_INDEX} ${cursor}`;
                response = await asyncClient.block((c) => {
                    return c.callAsync(...cmd.split(' '));
                });
            }
        }
    }
    return albumIds;
}

/**
 * Function the fetches all tracks for given array of albumIds.  Aggregates a song count for each artist
 * and then returns a configurable number of artists, ordered by descending song count.
 * @param {object} asyncClient - Redis client
 * @param {number[]} albumIds - Array of album Ids
 * @param {number} size - number JSON records to return
 * @returns {Object[]} JSON array of artist names and associated song counts
 */
async function getResults(asyncClient, albumIds, size) {
    let results = [];
    let ids = new Map();
    let response;
    
    for (let albumId of albumIds) {
        let artistId = ids.get(albumId);
        if (!artistId) {
            response = await asyncClient.runOnKey(`album:ALBUMID:${albumId}`, 'remote_json_get', `album:ALBUMID:${albumId}`, '$.ARTISTID'); 
            artistId = JSON.parse(response)[0];
            ids.set(albumId, artistId);
        }    
       
        const idx = results.findIndex((elm) => elm.ARTISTID == artistId);
        if (idx < 0) {
            response = await asyncClient.runOnKey(`artist:ARTISTID:${artistId}`, 'remote_json_get', `artist:ARTISTID:${artistId}`, '$.NAME');
            const artistName = JSON.parse(response)[0];
            results.push({ ARTISTID: artistId, NAME: artistName, SONGS: 1 });
        }
        else {
            results[idx].SONGS++;
        }   
    } 
    return results.sort((a, b) => b.SONGS - a.SONGS).slice(0, size);
}

/**   
 * Gears remote function to execute a JSON.GET for a given key.  Executed as a 'runOnKey' function.
 * @param {string} key - Redis JSON key
 * @param {string} path - JSON path
 * @returns {Object} - Return value from JSON.GET
*/
redis.registerClusterFunction('remote_json_get', async(asyncClient, key, path) => {
    return asyncClient.block((c) => {
        const cmd = `JSON.GET ${key} ${path}`;
        return c.call(...cmd.split(' '));
    });
});

/**   
 * Gears async function to execute all the above functions.  Returns an ordered JSON array of top artists
 * by song count for a given song genre. 
 * @param {string} genre - song genre
 * @param {number} size - number of artists to return
 * @returns {Object[]} - JSON array of artists and their associated song counts.
*/
redis.registerAsyncFunction('fetch', async (asyncClient, genre, size) => {
    redis.log(`function artist.fetch, genre: ${genre} size: ${size}`);
    const genreId = await getGenreId(asyncClient, genre); 
    if (!genreId) {
        const msg = `Error: Genre ID not found for ${genre}`
        redis.log(msg);
        return { error: msg };
    }
    const albumIds = await getAlbumIds(asyncClient, genreId);
    const results = await getResults(asyncClient, albumIds, size);
    return results;
});
