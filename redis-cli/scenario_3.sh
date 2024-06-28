#!/bin/bash
redis-cli -p 12000 FT.DROPINDEX idx
redis-cli -p 12000 FT.CREATE idx ON JSON PREFIX 1 invoice: SCHEMA $.CUSTOMERID AS CustomerId NUMERIC $.TOTAL AS Total NUMERIC
redis-cli -p 12000 FT.AGGREGATE idx * GROUPBY 1 @CustomerId REDUCE SUM 1 @Total AS Money_Spent SORTBY 2 @Money_Spent DESC MAX 1