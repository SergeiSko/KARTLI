var mysql = require('mysql'); //ДЛЯ РАБОТЫ С MYSQL
var bcrypt = require('bcrypt-nodejs'); //ДЛЯ ШИФРОВАНИЯ ПАРОЛЯ В БД
var dbconfig = require('./database'); //КОНФИГ С ПАРАМЕТРАМИ БД В JSON
var connection = mysql.createConnection(dbconfig.connection);
//
connection.query('USE ' + dbconfig.database);  //ПРИВЯЗКА К дб

//ФУНКЦИЯ ОБНОВЛЕНИЯ ПРОФИЛЯ
module.exports.updateProfile = function(name, surname, fathername, phonenumber, username, res){

  	console.log('updateprofile STARTED FROM passport');
  connection.query("UPDATE users SET name = ?, surname = ?, fathername = ?, phonenumber = ? WHERE email = ?",[name, surname, fathername, phonenumber,username], function(err, rows){
		_checkError(err, res, {message: 'Profile successful updated'});
    //res.status(200).send({success: 'Profile successful updated'});
		});

};

module.exports.getInfo = function(res, email){
  var query = "SELECT * FROM users INNER JOIN usertype ON usertype.usertypeid = users.usertypeid WHERE email = ?";
  connection.query(query, [email], function(err, rows){

    if(rows) {
      var userinfo = {
        name : rows[0].name,
        surname : rows[0].surname,
        fathername : rows[0].fathername,
        mobile : rows[0].phonenumber,
        usertype : rows[0].usertype,
        cash : rows[0].cash,
        email : email
      }
      _checkError(err, res,userinfo);
    //  res.send(userinfo);
    }
  });
}

module.exports.updateMail = function(res,oldmail, newemail){
  var oldmailquery = "SELECT * FROM users WHERE email= ?";
  connection.query(oldmailquery,[newemail], function(err, rows){

    _checkError(err, res);

    if(rows.length){
    //  res.send('Email is already taken');
      res.status(400).send({message: 'Email is already taken'});
//      console.log(rows);
    }
    else{
      var newmailquery = "UPDATE users SET email = ? WHERE email = ?";
      connection.query(newmailquery,[newemail, oldmail], function(err, rows){
        _checkError(err, res,{message: 'Mail successful updated'});
    //    res.send('Success');
  //  res.status(200).send({success: 'Mail successful updated'});
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
          _checkError(err, res,{message: 'Password successful updated'} );

        //  res.send('Success');


        });
      } else {
      //  res.send('password incorrect');
      res.status(401).send({message: 'Password incorrect'});
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
                _checkError(err, res,{message: 'Заказ успешно оформлен'});

              });

          } else {

            res.send({error : 'Недостаточно средств !'});
          }
   });
}

module.exports.searchTesk = function(res, polymerName, polymerType, polymerUsing, polymerColor){

  var searchCompany = "SELECT Companies.CompanyName, Routes.StartCity, Routes.EndCity,Polymers.Capacity, Polymers.PolymerPrice \
FROM (Companies INNER JOIN Routes ON Companies.CompanyId = Routes.CompanyId)  \
INNER JOIN Polymers ON Companies.CompanyId = Polymers.CompanyId \
WHERE Polymers.PolymerName= ? AND Polymers.PolymerType= ? AND Polymers.PolymerUsing= ? AND Polymers.Color = ?";


//[polymerName, polymerType, polymerUsing, polymerColor]
      connection.query(searchCompany,[polymerName, polymerType, polymerUsing, polymerColor], function(err, rows){
          _checkError(err, res, rows);
          console.log(rows);
        });
  //      res.send(":C");
}

function _checkError(error, response,successMessage){
  if(error){
    response.status(500).send({message:'SQL not working. Please inform admins'});
  //  response.end("SQL not working. Please inform admins");
    console.log(error);
  } else if(successMessage){
    response.status(200).send(successMessage);
  }
}
