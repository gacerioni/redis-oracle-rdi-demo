#!/bin/bash
redis-cli -p 12000 FT.DROPINDEX idx
redis-cli -p 12000 FT.CREATE idx ON JSON PREFIX 1 invoiceline: SCHEMA $.INVOICEID AS InvoiceId NUMERIC
while [[ $(redis-cli -p 12000 FT.INFO idx | awk '/percent_indexed/ {getline; print $0}') < 1 ]]; do sleep 1; done
redis-cli -p 12000 FT.AGGREGATE idx "@InvoiceId:[37 37]" GROUPBY 0 REDUCE COUNT 0 as Count