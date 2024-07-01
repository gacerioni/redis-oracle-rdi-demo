-- ----------------------------
--  What is the count of line items for Invoice ID 37?
-- ----------------------------
set lines 256;
set trimout on;
set tab off;
set pagesize 100;
set colsep " | ";

SELECT COUNT(InvoiceLineId)
FROM InvoiceLine
WHERE InvoiceId = 37;