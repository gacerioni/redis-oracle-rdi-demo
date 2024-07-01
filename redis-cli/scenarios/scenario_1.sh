#!/bin/bash
redis-cli -p 12000 FT.DROPINDEX idx
redis-cli -p 12000 FT.CREATE idx ON JSON PREFIX 1 invoice: SCHEMA $.BILLINGCOUNTRY AS BillingCountry TAG
while [[ $(redis-cli -p 12000 FT.INFO idx | awk '/percent_indexed/ {getline; print $0}') < 1 ]]; do sleep 1; done
redis-cli -p 12000 FT.AGGREGATE idx '*' GROUPBY 1 @BillingCountry REDUCE COUNT 0 AS Invoices SORTBY 2 @Invoices DESC MAX 5