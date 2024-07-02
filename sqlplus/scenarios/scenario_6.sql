-- ----------------------------
--  What is the count of line items for Invoice ID 37?
-- ----------------------------
SET lines 256;
SET trimout on;
SET tab off;
SET pagesize 100;
SET colsep " | ";

SELECT COUNT(InvoiceLineId)
FROM InvoiceLine
WHERE InvoiceId = 37;