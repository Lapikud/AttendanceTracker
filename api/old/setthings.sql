# The password has been hashed already, ask Silver for the pass.
SET PASSWORD FOR 'AttendanceTracker'@'localhost' = '';
# If need be, rename clumsy names using
RENAME USER 'AttendanceTracker'@'localhost' TO ar;
/*To rename a database under the root user you need to dump the contents of it somewhere and drop table,
 I didn't have any data in it though.*/
DROP DATABASE AttendanceTracker;
# Create a new database
CREATE DATABASE ar;
# Privileges need to be set if a database has been recreated during renaming
GRANT ALL PRIVILEGES ON ar TO ar;
# If you need to know the current users available in the database
SELECT User FROM mysql.user;
# See your current user
SELECT CURRENT_USER();