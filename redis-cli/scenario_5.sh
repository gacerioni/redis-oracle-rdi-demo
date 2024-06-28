#!/bin/bash
redis-cli -p 12000 FT.DROPINDEX idx
redis-cli -p 12000 FT.CREATE idx ON JSON PREFIX 1 employee: SCHEMA $.TITLE AS Title TAG
redis-cli -p 12000 FT.SEARCH idx "@Title:{Sales Support Agent}" RETURN 2 $.LASTNAME $.FIRSTNAME