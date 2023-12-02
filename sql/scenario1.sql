-- sqlplus chinook/Password1@localhost:1521/orclpdb1

-- ----------------------------
-- Which countries have the most Invoices?
-- ----------------------------
SELECT BillingCountry,
       COUNT(*)       AS Invoices 
  FROM Invoice
GROUP BY BillingCountry
ORDER BY Invoices DESC
FETCH FIRST 5 ROWS ONLY;