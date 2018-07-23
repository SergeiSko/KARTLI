
//СОЗДАНИЕ ТАБЛИЦЫ ДЛЯ БД, ЕСЛИ ОНА ОТСУТСТВУЕТ
//ЧТОБЫ СОЗДАТЬ ТАБЛИЦУ ВЫПОЛНИТЕ СКРИПТ ЧЕРЕЗ КОНСОЛЬ
var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
  `userid` INT NOT NULL AUTO_INCREMENT , \
`email` VARCHAR(45) NOT NULL , \
`password` VARCHAR(60) NOT NULL , \
`name` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL , \
`surname` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL , \
`fathername` VARCHAR(45) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL , \
`phonenumber` VARCHAR(15) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL , \
`usertypeid` INT NOT NULL , \
`cash` DOUBLE NOT NULL , \
PRIMARY KEY (`userid`), INDEX `userid` (`userid`), UNIQUE (`email`)) ENGINE = MyISAM; \
)');

console.log('Success: Database Created!')

connection.end();
