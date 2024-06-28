#!/bin/bash
redis-cli -p 12000 FT.DROPINDEX idx
redis-cli -p 12000 FT.CREATE idx ON JSON PREFIX 1 invoice: SCHEMA $.BILLINGCITY AS BillingCity TAG $.TOTAL AS Total NUMERIC
redis-cli -p 12000 FT.AGGREGATE -p 12000 idx * GROUPBY 1 @BillingCity REDUCE SUM 1 @Total AS InvoiceDollars SORTBY 2 @InvoiceDollars DESC MAX 3