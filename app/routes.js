// ./app/routes.js

module.exports = function(app, passport) {
//===================================
//МАРШРУТЫ
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
		res.redirect('/profile')
	}
	else {
		res.sendfile('public/home.html');
	}
});

app.get('/control',isLoggedIn, function(req, res){
	if(req.user.email == "admin"){
		res.sendfile('public/admin-profile.html');
	} else res.redirect('/');
})

}; //КОНЕЦ ЭКСПОРТА


//  MIDDLEWARE ПРОВЕРКИ АВТОРИЗАЦИИ С CALLBACK /
function isLoggedIn(req, res, next) {

	// ЕСЛИ ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН
	if (req.isAuthenticated())
		return next();

	// ЕСЛИ НЕТ, ТО ПЕРЕНАПРАВЛЕНИЕ НА ДОМАШНЮЮ СТРАНИЦУ
	res.redirect('/');
}
