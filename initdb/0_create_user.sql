CREATE USER 'dummy_user'@'%' IDENTIFIED WITH mysql_native_password BY 'dummy_password';
CREATE DATABASE news;
GRANT ALL PRIVILEGES ON news.* TO 'dummy_user'@'%';
