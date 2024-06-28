#!/bin/bash
redis-cli -p 12000 FT.DROPINDEX idx
redis-cli -p 12000 FT.CREATE idx ON JSON PREFIX 1 invoiceline: SCHEMA $INVOICEID AS InvoiceId NUMERIC
redis-cli -p 12000 FT.AGGREGATE idx "@InvoiceId:[37 37]" GROUPBY 0 REDUCE COUNT 0 as Count