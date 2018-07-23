// config/passport.js

//ЭКСПОРТ СТРАТЕГИИ ЛОКАЛЬНОЙ АВТОРИЗАЦИИ
var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql'); //ДЛЯ РАБОТЫ С MYSQL
var bcrypt = require('bcrypt-nodejs'); //ДЛЯ ШИФРОВАНИЯ ПАРОЛЯ В БД
var dbconfig = require('./database'); //КОНФИГ С ПАРАМЕТРАМИ БД В JSON
var connection = mysql.createConnection(dbconfig.connection);
//
connection.query('USE ' + dbconfig.database);  //ПРИВЯЗКА К дб

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
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };
                    //SQL ЗАПРОС НА ВСТАВКУ ПОЛЬЗОВАТЕЛЯ В БД
                    var insertQuery = "INSERT INTO users ( email, password, usertypeid ) values (?,?,1)";

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
            connection.query("SELECT * FROM users WHERE email = ?",[username], function(err, rows){
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
module.exports.SqlProfile = function(name, surname, fathername, phonenumber,usertype, username){
  	console.log('updateprofile STARTED FROM passport');
  connection.query("UPDATE users SET name = ?, surname = ?, fathername = ?, phonenumber = ?, usertypeid = ? WHERE email = ?",[name, surname, fathername, phonenumber,usertype,username], function(err, rows){
		if(err)console.log(err);
		});
};

module.exports.getInfo = function(res, email){
  var query = "SELECT * FROM users INNER JOIN usertype ON usertype.usertypeid = users.usertypeid WHERE email = ?";
  connection.query(query, [email], function(err, rows){
    if(err){
      res.end('sql not working');
      console.log(err);
    }
    if(rows) {
      var userinfo = {
        name : rows[0].name,
        surname : rows[0].surname,
        fathername : rows[0].fathername,
        mobile : rows[0].phonenumber,
        usertype : rows[0].usertype,
        cash : rows[0].cash
      }
      res.send(userinfo);
    }
  });
//
}
