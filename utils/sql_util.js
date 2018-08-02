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
  var query = "SELECT * FROM users WHERE email = ?";
  connection.query(query, [email], function(err, rows){

    if(rows) {
      var userinfo = {
        name : rows[0].name,
        surname : rows[0].surname,
        fathername : rows[0].fathername,
        mobile : rows[0].phonenumber,
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

      } else res.status(401).send({message: 'Password incorrect'});
    }
  });
}

module.exports.order = function(res, order){

  var discount = 100;
  //order: polymerId, date, client
  var getClientCash = "SELECT cash, id FROM users WHERE email=?";
  var clientCashDecrease = "UPDATE users SET cash = cash - ? WHERE email = ?";
  var sellerCashIncrease = "UPDATE users SET cash = cash + ? WHERE email = 'admin'";
  var getPolymerInfo = "SELECT CompanyId, PolymerPrice FROM polymers WHERE PolymerId=?";
  var insertOrder = "INSERT INTO orders (PolymerId, ClientId, CompanyId, PurchaseDate, Price) VALUES(?, ?, ?, ?, ?) ";

  connection.query("SELECT discount FROM discount", function(err, rows){
    _checkError(err, res);
    discount = rows[0].discount;
  });

  connection.query(getPolymerInfo, [order.polymerId], function(err, rows){
    _checkError(err, res);
    order.price = rows[0].PolymerPrice + rows[0].PolymerPrice*discount/100;
    order.companyId = rows[0].CompanyId;
    console.log(discount);
    connection.query(getClientCash, [order.client], function(err, rows){
     _checkError(err, res);
     order.userId = rows[0].id;
     order.balance = rows[0].cash - order.price;
          if(rows[0].cash>order.price){
              connection.query(clientCashDecrease, [order.price, order.client], function(err, rows){  //Снимаем деньги с покупателя
                _checkError(err, res);

                connection.query(sellerCashIncrease, [order.price], function(err, rows){ //добавляем деньги админу
                  _checkError(err, res);
                  connection.query(insertOrder, [order.polymerId, order.userId, order.companyId, order.date, order.price], function(err, rows){ //Добавление заказа в бд
                    _checkError(err, res,{message: 'Заказ успешно оформлен!', cash: order.balance});

                  });
                });
              });

        } else res.send({message : 'Недостаточно средств! Пожалуйста пополните счет.'});
          });
   });
}

module.exports.search = function(res,polymer){

  var params = "";
  if(polymer.name) params += " Polymers.PolymerName= " +  polymer.name ;
  if(polymer.type) if(params.length) params += " AND Polymers.PolymerType= " + polymer.type; else params +=" Polymers.PolymerType= "+ polymer.type;
  if(polymer.using)if(params.length) params += " AND Polymers.PolymerUsing= " + polymer.using; else params +=" Polymers.PolymerUsing= "+ polymer.using;
  if(polymer.color) if(params.length) params += " AND Polymers.Color = " + polymer.color; else params +=" Polymers.Color = " + polymer.color;

  if(params.length) params = "WHERE " + params;
  var searchquery = "SELECT polymers.PolymerId, polymers.PolymerPrice, polymerMarks.elemval AS Mark, \
   polymerTypes.elemval AS Type, polymerUsing.elemval AS Usings , \
    Colors.elemval AS Color, Companies.CompanyName \
    FROM Companies INNER JOIN (PolymerUsing INNER JOIN (PolymerTypes INNER JOIN \
   (PolymerMarks INNER JOIN (Colors INNER JOIN Polymers ON Colors.elemid = Polymers.Color) \
   ON PolymerMarks.elemid = Polymers.PolymerName) ON PolymerTypes.elemid = Polymers.PolymerType) \
   ON PolymerUsing.elemid = Polymers.PolymerUsing) ON Companies.CompanyId = Polymers.CompanyId \
  " + params;

//[polymerName, polymerType, polymerUsing, polymerColor]
      connection.query(searchquery, function(err, rows){
          _checkError(err, res, rows);
          console.log(rows);
        });
  //      res.send(":C");
}

module.exports.ordersView = function(res, email){

  var ordersQuery = "SELECT orders.Price , orders.PurchaseDate AS date, PolymerMarks.elemval AS mark, Companies.CompanyName AS company \
FROM Companies INNER JOIN ((PolymerMarks INNER JOIN Polymers ON PolymerMarks.elemid = Polymers.PolymerName) \
 INNER JOIN (users INNER JOIN orders ON users.id = orders.ClientId) ON Polymers.PolymerId = orders.PolymerId) ON \
 (users.id = orders.ClientId) AND (Companies.CompanyId = Polymers.CompanyId) AND (Companies.CompanyId = orders.CompanyId) \
WHERE users.email=? ";

  connection.query(ordersQuery,[email],function(err, rows){
      _checkError(err, res, rows);

  });
}

module.exports.catalog = function(res, table){

  var catalogQuery = "SELECT * FROM " + table;
  connection.query(catalogQuery, function(err, rows){
    _checkError(err, res, rows);
  });
}

module.exports.statement = function(res, order){

  //name, surname, fathername, mobile, polymerId
  var insertStatement = "INSERT INTO statement (name, surname, fathername, mobile, polymerId) VALUES (?, ?, ?, ?, ?)";
  connection.query(insertStatement,[order.name, order.surname, order.fathername, order.mobile, order.polymerId], function(err, rows){
    _checkError(err, res, {message: "Заявка успешно отправлена"});
  });
}

module.exports.discountControl = function(res, discount){
  connection.query("UPDATE discount SET discount = ?", [discount], function(err, rows){
    _checkError(err, res, {message: "Процент успешно изменился"});
  })
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
