-- ----------------------------
--  Which employees are Sales Agents?
-- ----------------------------
SET lines 256;
SET trimout on;
SET tab off;
SET pagesize 100;
SET colsep " | ";

SELECT LastName, FirstName FROM Employee
WHERE Employee.Title = 'Sales Support Agent';