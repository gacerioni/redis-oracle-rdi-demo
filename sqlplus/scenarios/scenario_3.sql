-- ----------------------------
--  Who is the best customer?
-- ----------------------------
SET lines 256;
SET trimout on;
SET tab off;
SET pagesize 100;
SET colsep " | ";

SELECT CustomerId, SUM(Total) AS Money_Spent 
FROM Invoice 
GROUP BY CustomerId 
ORDER BY Money_Spent DESC 
FETCH FIRST 1 ROWS ONLY;