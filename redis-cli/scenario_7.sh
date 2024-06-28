#!/bin/bash
redis-cli -p 12000 FT.DROPINDEX idx
redis-cli -p 12000 FT.CREATE idx ON JSON PREFIX 1 rockview: SCHEMA $.SONGS AS Songs NUMERIC SORTABLE
redis-cli -p 12000 FT.SEARCH idx * SORTBY Songs DESC LIMIT 0 10