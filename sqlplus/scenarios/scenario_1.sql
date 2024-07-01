-- sqlplus chinook/Password1@localhost:1521/orclpdb1

-- ----------------------------
-- Which countries have the most Invoices?
-- ----------------------------
set lines 256;
set trimout on;
set tab off;
set pagesize 100;
set colsep " | ";

SELECT BillingCountry, COUNT(*) AS Invoices 
FROM Invoice
GROUP BY BillingCountry
ORDER BY Invoices DESC
FETCH FIRST 5 ROWS ONLY;