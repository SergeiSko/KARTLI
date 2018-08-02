module.exports = function(app, passport){
  var updateprofile = require('../utils/sql_util').updateProfile;
  var getUsername = require('../utils/sql_util').getInfo;
  var updatemail = require('../utils/sql_util').updateMail;
  var updatepassword = require('../utils/sql_util').updatePassword;
  var order = require('../utils/sql_util').order;
  var search = require('../utils/sql_util').searchTesk;
  var ordersView = require('../utils/sql_util').ordersView;
  var catalog = require('../utils/sql_util').catalog;
  //=======================================
  // API
  //========================================


  //АВТОРИЗАЦИЯ /
  	app.post('/login', passport.authenticate('local-login', {
              successRedirect: false,
              failureRedirect: false,
              successRequest : true, //200 SEND STATUS OK ДОБАВЛЕНО ВО ФРЕЙМВОРК ПАСПОРТА
              failureRequest : true, //400 SEND STATUS ДОБАВЛЕНО ВО ФРЕЙМВОРК ПАСПОРТА
              failureFlash : false // allow flash messages
  		}),
          function(req, res) {
              console.log("hello");

              if (req.body.remember=="true") {
                req.session.cookie.maxAge = 1000 * 60 * 3;
              } else {
                req.session.cookie.expires = false;
              }
  						res.send(req.isAuthenticated());
          res.redirect('/');
      });


  //РЕГИСТРАЦИЯ
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: false,
    failureRedirect: false,
    successRequest : true, // OK 200 SEND STATUS ДОБАВЛЕНО ВО ФРЕЙМВОРК ПАСПОРТА
    failureRequest : true, // 400 STATUS SEND ДОБАВЛЕНО ВО ФРЕЙМВОРК ПАСПОРТА
		failureFlash : false // allow flash messages
	}),
	function(req, res){
		req.session.cookie.maxAge = 1000 * 60 * 3;
    console.log(req);
	}
);

//ВЫХОД
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

//ОБНОВЛЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЯХ
	app.post('/updateprofile',_authcheck, function(req, res){

		var username = req.user.email;
		var name = req.body.name;
  	var surname = req.body.surname;
		var fathername = req.body.fathername;
		var phonenumber = req.body.phonenumber;


		console.log('updateprofile STARTED FROM routes');

		updateprofile(name, surname, fathername, phonenumber, username, res);
	});

  //ПОИСК ПОСТАВЩИКОВ ПО 4 ПАРАМЕТРАМ: Название, Тип, Область применения, Цвет

  app.post('/search', function(req, res){
    var polymer = {
      name : req.body.name,
      type: req.body.type,
      using: req.body.oblast,
      color: req.body.color
    };

    console.log(req.body);
  //  res.send('k');
    search(res, polymer);
  });

  //СМЕНА ПОЧТЫ
app.post('/updatemail',_authcheck, function(req, res){
  if(req.isAuthenticated()){
      var oldmail = req.user.email;
      var newmail = req.body.newemail;
      updatemail(res, oldmail, newmail );
  }
});

    //СМЕНА ПАРОЛЯ
  app.post('/updatepassword',_authcheck, function(req, res){

    var bodyoldpass = req.body.oldpassword;  //Старый пароль, который ввели на странице смены пароля
    var bodynewpass = req.body.newpassword;
    var email = req.user.email;
    updatepassword(res,email, bodyoldpass, bodynewpass);

});
		//ПРОВЕРКА АВТОРИЗАЦИИ ПОЛЬЗОВАТЕЛЯ
	app.get('/authenticate', function(req ,res){
		if(req.isAuthenticated()) res.send(true); else res.send(false);
	});

//ПОЛУЧЕНИЕ ИМЕНИ, ФАМИЛИИ И НОМЕРА ТЕЛЕФОНА В JSON формате (name, surname, mobile)
	app.get('/userinfo',_authcheck, function(req, res){
    
			getUsername(res, req.user.email);
	});

  //Оформиление заказа
  app.post('/order', function(req, res){
    if(req.isAuthenticated()){
      var order = {
        polymerId : req.body.polymerId,
        date : Date.now(),
        client : req.user.email
      };
      //product { RoadId: , UserId(Клиент): , State: , CompanyId: ,price:  }
      //order: polymerId, date, client
      order(res, order);
      //res, clientlogin, sellerlogin, product)
    }
  });

  app.get('/ordersView',_authcheck, function(req, res){
      ordersView(res, req.user.email);
  });

  app.get('/catalog/polymers/:type', function(req, res){
    var name = req.params.type;
    switch (name) {
      case 'marks': catalog(res, 'polymermarks');  break;
      case 'types': catalog(res, 'polymertypes'); break;
      case 'using': catalog(res, 'polymerusing'); break;
      case 'colors': catalog(res, 'colors'); break;
      default: res.status(400).send('unknown request');
    }
  });

}

//Middleware для проверки аутенфикации клиента
function _authcheck(req, res, next){
      if(req.isAuthenticated()){
        return next();
      }
      else {
        res.status(401).send({message: 'User unauthorized'});
      }
}
// 401: Unauthorized
//200 : OK
