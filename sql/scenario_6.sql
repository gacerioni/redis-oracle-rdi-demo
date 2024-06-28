-- ----------------------------
--  What is the count of line items for Invoice ID 37?
-- ----------------------------
SELECT COUNT(InvoiceLineId)
FROM InvoiceLine
WHERE InvoiceId = 37;