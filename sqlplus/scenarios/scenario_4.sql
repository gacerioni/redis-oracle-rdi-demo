-- ----------------------------
--  Find the first 5 customers by Id who are not in the US.
-- ----------------------------
set lines 256;
set trimout on;
set tab off;
set pagesize 100;
set colsep " | ";

SELECT CustomerId, FirstName, LastName, Country
FROM Customer
WHERE not Country = 'USA'
ORDER BY CustomerId ASC
FETCH FIRST 5 ROWS ONLY;