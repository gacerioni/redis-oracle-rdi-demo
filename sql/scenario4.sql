-- ----------------------------
--  Which tracks have a song length longer than the average song length? 
-- ----------------------------
set linesize 250
column Name format a30
SELECT Name, Milliseconds
FROM Track
WHERE Milliseconds > (SELECT AVG(Milliseconds) FROM Track)
ORDER BY Milliseconds DESC
FETCH FIRST 5 ROWS ONLY; 