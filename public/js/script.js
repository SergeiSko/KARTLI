$(document).ready(function () {

	if ($('div.black')) {
		$.ajax({
				url: '/authenticate',
				type: 'GET',
				success: function (result){
					if (result == true) {
						$('div.black').load('login-header.html');
					} else {
						$('div.black').load('header.html');
					}
				}
		});
	}

	if ($(location).attr('href') == 'http://localhost:3000/profile') {
		$.ajax({
			url: '/userinfo',
			type: 'GET',
			success: function (result){
				$('form[name="about-self"] input[name="name"]').attr('value' , result.name);
				$('form[name="about-self"] input[name="surname"]').attr('value' , result.surname);
				$('form[name="about-self"] input[name="fathername"]').attr('value' , result.fathername);
				$('form[name="about-self"] input[name="phonenumber"]').attr('value' , result.mobile);
				if (result.cash != null) $('.put-add .row').children().eq(1).text(result.cash + "$");
				else $('.put-add .row').children().eq(1).text('0$');
			}
		});
	}

	$('div.bar').load('bar.html');


	$('form[name="sign-up"]').submit(function(e){
		var data = $(this).serialize();

		$.ajax({
			url: '/signup',
			type: 'POST',
			data: data,
			success: function (result){
				if (result == "Такой логин уже существует") {
					$('.pop-wrap input[type="text"]').addClass('alert-input');
					$('form[name="sign-up"] .alert').text(result);
				} else {
					$('.alert').css("color" , "green").text('Успешно!');
					$('.pop-wrap input').removeClass('alert-input');
					setTimeout(function (){
						$(location).attr('href' , '/profile');
					}, 1000);
				}
			}
		});

		e.preventDefault();
	});

	$('#pass-form-change').submit(function(e){
		var data = $(this).serialize();

		$.ajax({
			url: '/updatepassword',
			type: 'POST',
			data: data,
			success: function (result) {
				console.log(result);
			}
		});

		e.preventDefault();
	});

	$('#email-form-change').submit(function(e){
		var data = $(this).serialize();

		$.ajax({
			url: '/updatemail',
			type: 'POST',
			data: data,
			success: function (result) {
				console.log(result);
			}
		});

		e.preventDefault();
	});

	$('form[name="login"]').submit(function(e){
		var data = $(this).serialize();

		$.ajax({
			url: '/login',
			type: 'POST',
			data: data,
			success: function (result){
				if (result == "Неправильный логин или пароль") {
					$('.pop-wrap input[type="text"] , input[type="password"]').addClass('alert-input');
					$('form[name="login"] .alert').text(result);
				} else {
					$('.alert').css("color" , "green").text('Успешно!');
					$('.pop-wrap input').removeClass('alert-input');
					setTimeout(function (){
						$(location).attr('href' , '/products');
					}, 1000);
				}
			}
		});

		e.preventDefault();
	});

	$('form[name="about-self"]').submit(function (e){
		var data = $(this).serialize();

		$.ajax({
			url: '/updateprofile',
			type: 'POST',
			data: data,
			success: function (result){
				$('form[name="about-self" .alert]').text('Успешно!').css("color" , "green");
				}
		});

		e.preventDefault();
	});

	$('.hover').click(function (){
		$('.bar').slideUp();
		$('body').removeClass('fixed');
		$('#auto').slideUp();
		$('#reg').slideUp();
		$('.hover').css("opacity" , "0.1");
		$('.hover').css("z-index" , "0");
		$('.pop-wrap input').removeClass('alert-input');
		$('.alert').text('');
	});

	var $curr_pass = $('#pass-form-change input[name="oldpassword"]');
	var $new_pass = $('#pass-form-change input[name="new-pass"]');
	var $accept_pass = $('#pass-form-change input[name="newpassword"]');
	var $btn_saver = $('#btn-saver-pass');
	var $new_email = $('#email-form-change input[name="newemail"]');
	var $btn_saver_e = $('#btn-saver-email');
	var $name = $('form[name="about-self"] input[name="name"]');
	var $surname = $('form[name="about-self"] input[name="surname"]');
	var $fathername = $('form[name="about-self"] input[name="fathername"]');
	var $phonenumber = $('form[name="about-self"] input[name="phonenumber"]');


	$('#pass-form-change input[type="password"]').change(function (){
		if ($curr_pass.val() != '' && $new_pass.val() != '' && $accept_pass.val() != '') {
				if ($new_pass.val() != $accept_pass.val() && $accept_pass.val() != '') {
					$('.alert').text('Пароли не совпадают');
					$btn_saver.addClass('disabled-btn');
					$btn_saver.attr('disabled' , 'disabled');
				} else {
					$('.alert').text('');
					$btn_saver.removeClass('disabled-btn');
					$btn_saver.removeAttr('disabled');
				}
		} else {
			$btn_saver.addClass('disabled-btn');
			$btn_saver.attr('disabled' , 'disabled');
		}

	});

	$('form[name="about-self"] input[type="text"]').change(function (){
		if ($name.val() != '' && $surname.val() != '' && $fathername.val() != '' && $phonenumber.val() != '') {
			$('input[name="saver"]').removeClass('disabled-btn');
			$('input[name="saver"]').removeAttr('disabled');
		} else {
			$('input[name="saver"]').addClass('disabled-btn');
			$('input[name="saver"]').attr('disabled' , 'disabled');
		}
	});

	$('#email-form-change input[type="text"]').change(function (){
		if ($new_email.val() != '') {
			$btn_saver_e.removeClass('disabled-btn');
			$btn_saver_e.removeAttr('disabled');
		} else {
			$btn_saver_e.addClass('disabled-btn');
			$btn_saver_e.attr('disabled' , 'disabled');
		}

	});

}); //onload closed

function cancelHider(elem){
	$(elem).parent().parent().removeClass("flex");
	$(elem).parent().parent().parent().children("span").removeClass("hidden");
};

function openHider(elem) {
	$(elem).parent().children('span').addClass('hidden');
	$(elem).parent().children('form').addClass('flex');
};

function openMenu() {
	$('.bar').slideDown();
	$('.hover').css("opacity" , "0.8");
	$('.hover').css("z-index" , "2");
	$('body').addClass('fixed');
	if ($('.bar').css("display") == "block") {
		$('.bar').css("display" , "flex");
	}
}

function closeMenu(){
	$('.bar').slideUp();
	$('body').removeClass('fixed');
	$('.hover').css("opacity" , "0.1");
	$('.hover').css("z-index" , "0");
};

function Log(id) {
	$(id).slideDown();
	$('body').addClass('fixed');
	$('.hover').css("opacity" , "0.8");
	$('.hover').css("z-index" , "2");
}

function LogOut() {
	setTimeout(function (){
		$(location).attr('href' , '/logout');
	}, 500);
}

function dropProfile(elem) {
	$(elem).slideDown();
	$(elem).css("display" , "flex");
}

function hideProfile(elem) {
		$(elem).slideUp();
		console.log('hello');
}
