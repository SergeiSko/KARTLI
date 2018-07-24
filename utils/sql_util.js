var mysql = require('mysql'); //ДЛЯ РАБОТЫ С MYSQL
var bcrypt = require('bcrypt-nodejs'); //ДЛЯ ШИФРОВАНИЯ ПАРОЛЯ В БД
var dbconfig = require('./database'); //КОНФИГ С ПАРАМЕТРАМИ БД В JSON
var connection = mysql.createConnection(dbconfig.connection);
//
connection.query('USE ' + dbconfig.database);  //ПРИВЯЗКА К дб

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

module.exports.updatemail = function(res,oldmail, newemail){
  var oldmailquery = "SELECT * FROM users WHERE email= ?";
  connection.query(oldmailquery,[newemail], function(err, rows){
    if(err){
      console.log(err);
      res.end('SQL not working');
    }
    if(rows.length){
      res.end('Email is already taken');
      console.log(rows);
    }
    else{
      var newmailquery = "UPDATE users SET email = ? WHERE email = ?";
      connection.query(newmailquery,[newemail, oldmail], function(err, rows){
        if(err){ console.log(err);
          res.end('Sql not working, check console');
        }
        res.end('Success');
      });
    }
  });
}

module.exports.updatepassword = function(res, email, oldpassword, newpassword){
  var oldpass = bcrypt.hashSync(oldpassword, null, null);
  var newpass = bcrypt.hashSync(newpassword, null, null);
  console.log( oldpass, newpass);
  connection.query("SELECT password FROM users WHERE email = ?", [email], function(err, rows){
    if(err) console.log(err);
    if(rows.length) {
      if(bcrypt.compareSync(oldpassword, rows[0].password)) {
        var oldpassquery = "UPDATE users SET password = ? WHERE email =?";
        connection.query(oldpassquery, [newpass, email], function(err, rows){
          if(err){
            console.log(err);
            res.end('Sql not working');
          }
          res.end('Success');
        });
      } else {
        res.end('password incorrect');
      }
    }
  });

}
