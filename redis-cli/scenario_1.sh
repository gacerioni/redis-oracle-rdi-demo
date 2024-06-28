#!/bin/bash
redis-cli -p 12000 FT.DROPINDEX idx
redis-cli -p 12000 FT.CREATE idx ON JSON PREFIX 1 invoice: SCHEMA $.BILLINGCOUNTRY AS BillingCountry TAG
redis-cli -p 12000 FT.AGGREGATE idx * GROUPBY 1 @BillingCountry REDUCE COUNT 0 AS Invoices SORTBY 2 @Invoices DESC MAX 5