// server.js

// ПОДКЛЮЧЕНИЕ ВСЕХ НЕОБХОДИМЫХ МОДУЛЕЙ

var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 3000;
var passport = require('passport');
var flash    = require('connect-flash');

// TEST TEST

require('./config/passport')(passport); // pass passport for configuration

//

// УСТАНОВКА EXPRESS
app.use(morgan('dev')); //ВЫВОД В КОНСОЛЬ КАЖДОГО ЗАПРОСА ДЛЯ ОТЛАДКИ
app.use(cookieParser()); // ЧТЕНИЕ COOKIE - файлов
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // ДВИЖОК ДЛЯ EJS-a

// PASSPORT инициализация
app.use(session({
	secret: 'kartlikey', //СЕКРЕТНЫЙ КЛЮЧ ДЛЯ ШИФРОВАНИЯ ПАРОЛЕЙ
	resave: true,
	saveUninitialized: true
 } ));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(express.static(__dirname + "/public")); //ПОДКЛЮЧЕНИЕ СТАТИЧЕСКИХ ФАЙЛОВ

require('./app/routes.js')(app, passport); // МОДУЛЬ МАРШРУТИЗАЦИИ
require('./app/api.js')(app, passport); //МОДУЛЬ API

// ЗАПУСК СЕРВЕРА ======================================================================
app.listen(port);
console.log('Сервер слушает порт ' + port);
