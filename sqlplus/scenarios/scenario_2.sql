-- ----------------------------
-- Which city has the best customers?
-- ----------------------------
SET lines 256;
SET trimout on;
SET tab off;
SET pagesize 100;
SET colsep " | ";

SELECT BillingCity, SUM(Total)  AS InvoiceDollars 
FROM Invoice
GROUP BY BillingCity 
ORDER BY InvoiceDollars DESC
FETCH FIRST 3 ROWS ONLY;