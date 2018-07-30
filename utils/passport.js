// config/passport.js

//ЭКСПОРТ СТРАТЕГИИ ЛОКАЛЬНОЙ АВТОРИЗАЦИИ
var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql'); //ДЛЯ РАБОТЫ С MYSQL
var bcrypt = require('bcrypt-nodejs'); //ДЛЯ ШИФРОВАНИЯ ПАРОЛЯ В БД
var dbconfig = require('./database'); //КОНФИГ С ПАРАМЕТРАМИ БД В JSON
var connection = mysql.createConnection(dbconfig.connection);
//
connection.query('USE ' + dbconfig.database);  //ПРИВЯЗКА К дб



module.exports = function(passport) {

    //MIDDLEWARE СОЗДАНИЯ СЕССИИ ПОЛЬЗОВАТЕЛЯ
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    //MIDDLEWARE УДАЛЕНИЯ СЕССИИ ПОЛЬЗОВАТЕЛЯ
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
            connection.query("SELECT * FROM users WHERE email = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'ПОЛЬЗОВАТЕЛЬ С ТАКИМ ЛОГИНОМ УЖЕ СУЩЕСТВУЕТ'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null), // use the generateHash function in our user model
                        usertypid: req.body.typer
                    };
                    //SQL ЗАПРОС НА ВСТАВКУ ПОЛЬЗОВАТЕЛЯ В БД
                    var insertQuery = "INSERT INTO users ( email, password, usertypeid ) values (?,?,?)";
                    console.log(newUserMysql);
                    //ВЫПОЛНЕНИЕ SQL ЗАПРОСА
                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password, newUserMysql.usertypid],function(err, rows) {
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
            connection.query("SELECT * FROM users WHERE email = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                    //ПРОВЕРЯЕМ ЕСТЬ ЛИ ВООБЩЕ ПОЛЬЗОВАТЕЛЬ С ТАКИМ ЛОГИНОМ
                if (!rows.length) {
                    return done(null, false,'loginerror');
                }

                //ЕСЛИ ВСЕ ОКЕЙ, ТО ДАЛЬШЕ ПРОВЕРЯЕТСЯ ПАРОЛЬ
                if (!bcrypt.compareSync(password, rows[0].password))
                  //  return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    return done(null, false, 'passwordwrong');

                // ЕСЛИ ПОДОШЕЛ ПАРОЛЬ ТО ВОЗВРАЩАЕМ ПОЛЕ ПОЛЬЗОВАТЕЛЯ ИЗ БД
                return done(null, rows[0]);
            });
        })
    );
};
