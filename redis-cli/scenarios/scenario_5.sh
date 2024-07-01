#!/bin/bash
redis-cli -p 12000 FT.DROPINDEX idx
redis-cli -p 12000 FT.CREATE idx ON JSON PREFIX 1 employee: SCHEMA $.TITLE AS Title TAG
while [[ $(redis-cli -p 12000 FT.INFO idx | awk '/percent_indexed/ {getline; print $0}') < 1 ]]; do sleep 1; done
redis-cli -p 12000 FT.SEARCH idx "@Title:{Sales Support Agent}" RETURN 2 $.LASTNAME $.FIRSTNAME