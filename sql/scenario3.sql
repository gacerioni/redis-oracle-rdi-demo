-- ----------------------------
--  Who is the best customer?
-- ----------------------------
SELECT CustomerId, SUM(Total) AS Money_Spent 
FROM Invoice 
GROUP BY CustomerId 
ORDER BY Money_Spent DESC 
FETCH FIRST 1 ROWS ONLY;