var mysql = require('mysql'); //ДЛЯ РАБОТЫ С MYSQL
var bcrypt = require('bcrypt-nodejs'); //ДЛЯ ШИФРОВАНИЯ ПАРОЛЯ В БД
var dbconfig = require('./database'); //КОНФИГ С ПАРАМЕТРАМИ БД В JSON
var connection = mysql.createConnection(dbconfig.connection);
//
connection.query('USE ' + dbconfig.database);  //ПРИВЯЗКА К дб

//ФУНКЦИЯ ОБНОВЛЕНИЯ ПРОФИЛЯ
module.exports.updateProfile = function(name, surname, fathername, phonenumber,usertype, username){

  	console.log('updateprofile STARTED FROM passport');
  connection.query("UPDATE users SET name = ?, surname = ?, fathername = ?, phonenumber = ?, usertypeid = ? WHERE email = ?",[name, surname, fathername, phonenumber,usertype,username], function(err, rows){
		if(err)console.log(err);
		});
};

module.exports.getInfo = function(res, email){
  var query = "SELECT * FROM users INNER JOIN usertype ON usertype.usertypeid = users.usertypeid WHERE email = ?";
  connection.query(query, [email], function(err, rows){
    _checkError(err, res);
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

module.exports.updateMail = function(res,oldmail, newemail){
  var oldmailquery = "SELECT * FROM users WHERE email= ?";
  connection.query(oldmailquery,[newemail], function(err, rows){

    _checkError(err, res);

    if(rows.length){
      res.send('Email is already taken');
      console.log(rows);
    }
    else{
      var newmailquery = "UPDATE users SET email = ? WHERE email = ?";
      connection.query(newmailquery,[newemail, oldmail], function(err, rows){
        _checkError(err, res);
        res.send('Success');
      });
    }
  });
}

module.exports.updatePassword = function(res, email, oldpassword, newpassword){

  var oldpass = bcrypt.hashSync(oldpassword, null, null);  //ГЕНЕРАЦИЯ ХЕША ДЛЯ СТАРОГО ВВЕДЕННОГО ПАРОЛЯ
  var newpass = bcrypt.hashSync(newpassword, null, null); //ГЕНЕРАЦИЯ ХЕША ДЛЯ НОВОГО ВВЕДЕННОГО ПАРОЛЯ

  connection.query("SELECT password FROM users WHERE email = ?", [email], function(err, rows){
    _checkError(err, res);

    if(rows.length) {

      if(bcrypt.compareSync(oldpassword, rows[0].password)) {             //СРАВНЕНИЕ ПАРОЛЕЙ СТАРОГО ВВЕДЕННОГО ПАРОЛЯ

        var oldpassquery = "UPDATE users SET password = ? WHERE email =?";

        connection.query(oldpassquery, [newpass, email], function(err, rows){
          _checkError(err, res);

          res.send('Success');
        });
      } else {
        res.send('password incorrect');
      }
    }
  });
}

module.exports.order = function(res, clientlogin, sellerlogin, product){

  var getClientCash = "SELECT cash FROM users WHERE = email?";
  var clientCashDecrease = "UPDATE users SET cash = cash - ? WHERE email = ?";
  var sellerCashIncrease = "UPDATE users SET cash = cash + ? WHERE email = ?";
  var insertOrder = "INSERT INTO orders (RoadId, id, State, CompanyId, Price) VALUES(?, ?, ?, ?, ?) ";

   connection.query(getClientCash, [clientlogin], function(err, rows){
     _checkError(err, res);

          if(rows[0].cash>product.price){
              connection.query(clientCashDecrease, [product.price, clientlogin], function(err, rows){  //Снимаем деньги с покупателя
                _checkError(err, res);

              });

              connection.query(sellerCashIncrease, [product.price, sellerlogin], function(err, rows){ //добавляем деньги поставщику
                _checkError(err, res);
              });

              connection.query(insertOrder, [product.RoadId, product.UserId, product.State, product.CompanyId, product.price], function(err, rows){ //Добавление заказа в бд
                _checkError(err, res);
                res.send("Заказ успешно оформлен");
              });

          } else {

            res.send('Недостаточно средств !');
          }
   });
}

function _checkError(error, response){
  if(error){
    response.end("SQL not working. Please inform admins");
    console.log(error);
  }
}
