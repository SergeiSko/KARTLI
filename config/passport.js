// config/passport.js

//ЭКСПОРТ СТРАТЕГИИ ЛОКАЛЬНОЙ АВТОРИЗАЦИИ
var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql'); //ДЛЯ РАБОТЫ С MYSQL
var bcrypt = require('bcrypt-nodejs'); //ДЛЯ ШИФРОВАНИЯ ПАРОЛЯ В БД
var dbconfig = require('./database'); //
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);  //ПРИВЯЗКА К ТАБЛИЦЕ

//ЭКСПОРТИРУЕМ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ МОДУЛЯХ
module.exports = function(passport) {

    //МЕТОД СОЗДАНИЯ СЕССИИ ПОЛЬЗОВАТЕЛЯ
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    //МЕТОД УДАЛЕНИЯ СЕССИИ ПОЛЬЗОВАТЕЛЯ
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });


    //ПАСПОРТ СТРАТЕГИЯ ДЛЯ РЕГИСТРАЦИИ
    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            //ПРОВЕРЯЕМ НАЛИЧИЕ ЛОГИНА В БД, УКАЗАННОГО ПРИ РЕГИСТРАЦИИ
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'ПОЛЬЗОВАТЕЛЬ С ТАКИМ ЛОГИНОМ УЖЕ СУЩЕСТВУЕТ'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };
                    //SQL ЗАПРОС НА ВСТАВКУ ПОЛЬЗОВАТЕЛЯ В БД
                    var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                    //ВЫПОЛНЕНИЕ SQL ЗАПРОСА
                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;
                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );


    //ПАСПОРТ СТРАТЕГИЯ НА АВТОРИЗАЦИЮ ПОЛЬЗОВАТЕЛЯ
    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                    //ПРОВЕРЯЕМ ЕСТЬ ЛИ ВООБЩЕ ПОЛЬЗОВАТЕЛЬ С ТАКИМ ЛОГИНОМ
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                //ЕСЛИ ВСЕ ОКЕЙ, ТО ДАЛЬШЕ ПРОВЕРЯЕТСЯ ПАРОЛЬ
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // ЕСЛИ ПОДОШЕЛ ПАРОЛЬ ТО ВОЗВРАЩАЕМ ПОЛЕ ПОЛЬЗОВАТЕЛЯ ИЗ БД
                return done(null, rows[0]);
            });
        })
    );
};

//ФУНКЦИЯ ОБНОВЛЕНИЯ ПРОФИЛЯ
module.exports.SqlProfile = function(name, surname, fathername, phonenumber, username){
  	console.log('updateprofile STARTED FROM passport');
  connection.query("UPDATE test.users SET name = ?, surname = ?, fathername = ?, phonenumber = ? WHERE username = ?",[name, surname, fathername, phonenumber,username], function(err, rows){
		if(err)console.log(err);
		});
};
