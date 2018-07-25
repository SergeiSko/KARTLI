// config/passport.js

//ЭКСПОРТ СТРАТЕГИИ ЛОКАЛЬНОЙ АВТОРИЗАЦИИ
var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql'); //ДЛЯ РАБОТЫ С MYSQL
var bcrypt = require('bcrypt-nodejs'); //ДЛЯ ШИФРОВАНИЯ ПАРОЛЯ В БД
var dbconfig = require('./database'); //КОНФИГ С ПАРАМЕТРАМИ БД В JSON
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);  //ПРИВЯЗКА К дб

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports.updateprofile  = function(username, name, surname, fathername, phonenumber){

  };

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
}

module.exports.searchTesk = function(start_city, finish_city, mass, price, result){
  var mysql = require("mysql");
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kartli',
    port: 3306
  });
  connection.connect();
  connection.query("SELECT company.name, route.km, car.mass, price_for_km*km AS price \
  FROM (((((user_type JOIN users \
  ON user_type.user_type_id = users.user_type_id) \
  JOIN company ON users.user_id = company.user_id) \
  JOIN car ON company.company_id = car.company_id) \
  JOIN company_route ON car.company_id = company_route.company_id) \
  JOIN route ON company_route.route_id = route.route_id) \
  WHERE start_city = (SELECT city_id FROM city WHERE name='"+start_city+"') \
  AND finish_city = (SELECT city_id FROM city WHERE name='"+finish_city+"') \
  AND in_city = (SELECT city_id FROM city WHERE name='"+start_city+"') \
  AND car.mass >= "+mass+" \
  AND "+price+" >= \
  (SELECT (price_for_km * (SELECT km AS price FROM route \
  WHERE start_city = (SELECT city_id FROM city WHERE name='"+start_city+"') \
  AND finish_city = (SELECT city_id FROM city WHERE name='"+finish_city+"'))) AS price \
  FROM `company` WHERE company_id = (SELECT company_id FROM company_route \
  WHERE route_id = (SELECT route_id FROM route \
  WHERE start_city = (SELECT city_id FROM city WHERE name='"+start_city+"') \
  AND finish_city = (SELECT city_id FROM city WHERE name='"+finish_city+"'))))",
  function(err, res){
     if(err) console.log(err);
     result.send(res);
   });
connection.end();
};
