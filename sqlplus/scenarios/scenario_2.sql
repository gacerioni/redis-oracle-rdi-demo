-- ----------------------------
-- Which city has the best customers?
-- ----------------------------
set lines 256;
set trimout on;
set tab off;
set pagesize 100;
set colsep " | ";

SELECT BillingCity, SUM(Total)  AS InvoiceDollars 
FROM Invoice
GROUP BY BillingCity 
ORDER BY InvoiceDollars DESC
FETCH FIRST 3 ROWS ONLY;