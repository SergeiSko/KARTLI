

module.exports = function(app, passport) {
var updateprofile = require('../config/passport').SqlProfile;
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
//===================================
//HTML СТРАНИЦЫ
//===================================
app.get('/profile', function(req, res){
	if(req.isAuthenticated()){
		res.sendfile('public/profile-company.html');
	}
	else {
		res.redirect('/');
	}
});
app.get('/products', function(req, res){
	res.sendfile('public/product-list-log.html')
});

app.get('/', function(req, res){
	if(req.isAuthenticated()){
		res.sendfile('public/profile-company.html');
	}
	else {
		res.sendfile('public/home.html');
	}

});

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

	app.get('/authenticate', function(req ,res){
		if(req.isAuthenticated()) res.send(true); else res.send(false);
	});

}; //КОНЕЦ ЭКСПОРТА



//  ФУКНЦИЯ ПРОВЕРКИ АВТОРИЗАЦИИ С CALLBACK
function isLoggedIn(req, res, next) {

	// ЕСЛИ ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН
	if (req.isAuthenticated())
		return next();

	// ЕСЛИ НЕТ, ТО ПЕРЕНАПРАВЛЕНИЕ НА ДОМАШНЮЮ СТРАНИЦУ
	res.redirect('/');
}
