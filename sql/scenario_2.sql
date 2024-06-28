-- ----------------------------
-- Which city has the best customers?
-- ----------------------------
SELECT BillingCity, SUM(Total)  AS InvoiceDollars 
FROM Invoice
GROUP BY BillingCity 
ORDER BY InvoiceDollars DESC
FETCH FIRST 3 ROWS ONLY;