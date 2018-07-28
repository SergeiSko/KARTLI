module.exports = function(app, passport){
  var updateprofile = require('../utils/sql_util').updateProfile;
  var getUsername = require('../utils/sql_util').getInfo;
  var updatemail = require('../utils/sql_util').updateMail;
  var updatepassword = require('../utils/sql_util').updatePassword;
  var order = require('../utils/sql_util').order;
  var search = require('../utils/sql_util').searchTesk;
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

              if (req.body.remember) {
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
	}
);

 app.get('/signuperror', function(req, res){
	res.end("Такой логин уже существует");
});

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

		updateprofile(name, surname, fathername, phonenumber,1, username, res);
	});

  //ПОИСК ПОСТАВЩИКОВ ПО 4 ПАРАМЕТРАМ: Название, Тип, Область применения, Цвет

  app.post('/search', function(req, res){
    var polymerName = req.body.name;
    var polymerType = req.body.type;
    var polymerUsing = req.body.oblast;
    var polymerColor = req.body.color;
    console.log(req.body);
  //  res.send('k');
    search(res, polymerName, polymerType, polymerUsing, polymerColor);
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
  app.post('/order',_authcheck, function(req, res){
    var product = {
      name : req.body.productname,
      price : req.body.price,
      route : req.body.route,
      company : req.body.company
    };
    //product { RoadId: , UserId(Клиент): , State: , CompanyId: ,price:  }
    var client = req.body.buyer;
    var seller = req.body.seller;
    order(res, client, seller, product);
    //res, clientlogin, sellerlogin, product)
  });
}

//Middleware для проверки аутенфикации клиента
function _authcheck(req, res, next){
      if(req.isAuthenticated()){
        return next();
      }
      else {
        res.sendStatus(401);
      }
}
// 401: Unauthorized
//200 : OK
