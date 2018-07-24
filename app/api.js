module.exports = function(app, passport){
  var updateprofile = require('../utils/passport').SqlProfile;
  var getUsername = require('../utils/passport').getInfo;
  var updatemail = require('../utils/passport').updatemail;
  var updatepassword = require('../utils/passport').updatepassword;
  //=======================================
  // API
  //========================================

  //АВТОРИЗАЦИЯ /
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

		var username = req.user.email;
		var name = req.body.name;
		var surname = req.body.surname;
		var fathername = req.body.fathername;
		var phonenumber = req.body.phonenumber;

		console.log('updateprofile STARTED FROM routes');

		updateprofile(name, surname, fathername, phonenumber,1, username);
	});
app.post('/updatemail', function(req, res){
  if(req.isAuthenticated()){
      var oldmail = req.user.email;
      var newmail = req.body.newemail;
      updatemail(res, oldmail, newmail );
  }
});
app.post('/updatepassword', function(req, res){
  if(req.isAuthenticated()){
    var bodyoldpass = req.body.oldpassword;  //Старый пароль, который ввели на странице смены пароля
    var bodynewpass = req.body.newpassword;
    var email = req.user.email;
    updatepassword(res,email, bodyoldpass, bodynewpass);
  } else {
    res.end('permission denied');
  }
})
		//ПРОВЕРКА АВТОРИЗАЦИИ ПОЛЬЗОВАТЕЛЯ
	app.get('/authenticate', function(req ,res){
		if(req.isAuthenticated()) res.send(true); else res.send(false);
	});

//ПОЛУЧЕНИЕ ИМЕНИ, ФАМИЛИИ И НОМЕРА ТЕЛЕФОНА В JSON формате (name, surname, mobile)
	app.get('/userinfo', function(req, res){
		if(!req.user){
			res.send('User not found');
		} else {
			getUsername(res, req.user.email);
		}
	});

}
