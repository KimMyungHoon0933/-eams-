CREATE USER IF NOT EXISTS 'testuser'@'localhost' IDENTIFIED BY '1234';

-- univer 전체 권한 부여
GRANT ALL PRIVILEGES ON `univer`.* TO 'testuser'@'localhost';
GRANT ALL PRIVILEGES ON `univer`.* TO 'testuser'@'%';