-- ----------------------------
--  Who is the best customer?
-- ----------------------------
set lines 256;
set trimout on;
set tab off;
set pagesize 100;
set colsep " | ";

SELECT CustomerId, SUM(Total) AS Money_Spent 
FROM Invoice 
GROUP BY CustomerId 
ORDER BY Money_Spent DESC 
FETCH FIRST 1 ROWS ONLY;