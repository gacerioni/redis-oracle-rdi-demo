-- ----------------------------
--  Find the first 5 customers by Id who are not in the US.
-- ----------------------------
SET lines 256;
SET trimout on;
SET tab off;
SET pagesize 100;
SET colsep " | ";

SELECT CustomerId, FirstName, LastName, Country
FROM Customer
WHERE not Country = 'USA'
ORDER BY CustomerId ASC
FETCH FIRST 5 ROWS ONLY;