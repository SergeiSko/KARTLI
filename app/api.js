module.exports = function(app, passport){
  var updateprofile = require('../config/passport').SqlProfile;
  var getUsername = require('../config/passport').getInfo;
  //=======================================
  // API
  //========================================

  //АВТОРИЗАЦИЯ
  	app.post('/login', passport.authenticate('local-login', {
              successRedirect : '/products', // redirect to the secure profile section
              failureRedirect : '/loginerror', // redirect back to the signup page if there is an error
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


  		app.get('/loginerror', function(req, res){
  			res.send('Неправильный логин или пароль');
  		});

  //РЕГИСТРАЦИЯ
  app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signuperror', // redirect back to the signup page if there is an error
		failureFlash : false // allow flash messages
	}),
	function(req, res){
		req.session.cookie.maxAge = 1000 * 60 * 3;
	}
);

 app.get('/signuperror', function(req, res){
	res.send("Такой логин уже существует");
});

//ВЫХОД
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

//ОБНОВЛЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЯХ
	app.post('/updateprofile', function(req, res){

		var username = req.user.username;
		var name = req.body.name;
		var surname = req.body.surname;
		var fathername = req.body.fathername;
		var phonenumber = req.body.phonenumber;

		console.log('updateprofile STARTED FROM routes');

		updateprofile(name, surname, fathername, phonenumber, username);
	});
  global.vol1 = "Kazan";
  global.vol1 = "Moscow";
  //ПОИСК ПОСТАВЩИКОВ ПО НЕОМБХОДИМЫМ ПАРАМЕТРАМ
  var mysql = require("mysql");
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306
  });
  connection.connect()
  app.post('/searchTesk', function(req, res){
    var query = connection.query("SELECT city_id FROM city WHERE name='Kazan'", function(err, res){

    });
    //res.send(global.vol1);



    //req.body.from--возвращает содержимое формы "откуда"
    //res.send("Работает!!!");
  });

		//ПРОВЕРКА АВТОРИЗАЦИИ ПОЛЬЗОВАТЕЛЯ
	app.get('/authenticate', function(req ,res){
		if(req.isAuthenticated()) res.send(true); else res.send(false);
	});

//ПОЛУЧЕНИЕ ИМЕНИ, ФАМИЛИИ И НОМЕРА ТЕЛЕФОНА В JSON формате (name, surname, mobile)
	app.get('/userinfo', function(req, res){
		if(!req.user){
			res.send('User not found');
		} else {
			getUsername(res, req.user.username);
		}
	});

}
