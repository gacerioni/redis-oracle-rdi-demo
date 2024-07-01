-- ----------------------------
--  Which employees are Sales Agents?
-- ----------------------------
set lines 256;
set trimout on;
set tab off;
set pagesize 100;
set colsep " | ";

SELECT LastName, FirstName FROM Employee
WHERE Employee.Title = 'Sales Support Agent';