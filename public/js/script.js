var $cash, $button_buy;
$(document).ready(function () {

	if ($('div.black')) {
		$.ajax({
				url: '/authenticate',
				type: 'GET',
				success: function (result){
					if (result == true) {
						$('div.black').load('login-header.html');
						$button_buy = 'Приобрести';
					} else {
						$('div.black').load('header.html');
						$button_buy = 'Оформить заявку';
					}
				}
		});
	}

	if ($('div.black')) {
		$.ajax({
			url: '/userinfo',
			type: 'GET',
			success: function (result){
				if (result.cash != null) $cash = result.cash;
				else $cash = 0;
				if ($(location).attr('href') == 'http://localhost:3000/profile') {
					$('form[name="about-self"] input[name="name"]').attr('value' , result.name);
					$('form[name="about-self"] input[name="surname"]').attr('value' , result.surname);
					$('form[name="about-self"] input[name="fathername"]').attr('value' , result.fathername);
					$('form[name="about-self"] input[name="phonenumber"]').attr('value' , result.mobile);
					$('#profile-bank').text($cash + "$")
					$('div[id=row-s] span[id=email-span]').text(result.email);
					$('form[id=email-form-change] span[id=emailold-span]').text("Ваш старый email: " + result.email);
			  }
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
			statusCode:{
				200: function(){
					$('.alert').css("color" , "green").text('Успешно!');
					$('.pop-wrap input').removeClass('alert-input');
					setTimeout(function (){
						$(location).attr('href' , '/profile');
					}, 1000);
				},
				400: function(){
					$('.pop-wrap input[type="text"]').addClass('alert-input');
					$('form[name="sign-up"] .alert').text("Такой логин уже существует!");
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
			statusCode:{
				200: function(){
					$('#pass-form-change .alert').text('Успешно!').css("color" , "green");
					setTimeout(function(){
							$('#pass-form-change .alert').text('');
					}, 4000);
				},
				401: function(){
					$('#pass-form-change .alert').text('Неправильный пароль!').css("color" , "red");
					setTimeout(function(){
							$('#pass-form-change .alert').text('');
					}, 4000);
				}
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
			statusCode: {
				200: function () {

					$('#email-form-change .alert').text('Успешно!').css("color" , "green");
					setTimeout(function(){
							$('#email-form-change .alert').text('');
					}, 4000);
			},
			400: function(){
				$('#email-form-change .alert').text('Такая почта уже занята!').css("color" , "red");
				setTimeout(function(){
						$('#email-form-change .alert').text('');
				}, 4000);
			}
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
			statusCode: {
				200: function(){
					$('.alert').css("color" , "green").text('Успешно!');
					$('.pop-wrap input').removeClass('alert-input');
					setTimeout(function (){
						$(location).attr('href' , '/products');
					}, 1000);
				},
				400: function(){
					$('.pop-wrap input[type="text"] , input[type="password"]').addClass('alert-input');
					$('form[name="login"] .alert').text("Неправильный логин или пароль!");
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
			statusCode:{
					200:function (){
	 				$('form[name="about-self"] .alert').text('Успешно!').css("color" , "green");
					setTimeout(function(){
						$('form[name="about-self"] .alert').text('');
					}, 3000)
				},
					400: function (){
	 				$('form[name="about-self"] .alert').text('Ошибка!').css("color" , "red");
					setTimeout(function(){
						$('form[name="about-self"] .alert').text('');
					},3000)
	 				}
				}
		});

		e.preventDefault();
	});

	$('.hover').click(function (){
		$('.bar').slideUp();
		$('body').removeClass('fixed');
		$('#auto').slideUp();
		$('#reg').slideUp();
		$('#buyer_guest').slideUp();
		$('#buyer').slideUp();
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

	if ($('.select-group')) {
		ajaxSelect('colors');
		ajaxSelect('using');
		ajaxSelect('types');
		ajaxSelect('marks');
		$.ajax({
			url: '/search',
			type: 'POST',
			success: function(result) {
				polymersList(result);
			}
		});
	}

	$('form[name="search-filter"] input[type="button"]').click(function (){
		var data = {
			name: $('input[name="polymerName"]').attr('id'),
			type: $('input[name="polymerType"]').attr('id'),
			oblast: $('input[name="polymerUsing"]').attr('id'),
			color: $('input[name="polymerColor"]').attr('id')
		};
		$.ajax({
			url: '/search',
			type: 'POST',
			data: data,
			success: function(result) {
				polymersList(result);
			}
		});

	});

	$('.closer').click(function (){
		$(this).parent().children('input').val('');
		$(this).parent().children('input').attr('id' , null);
		$(this).parent().children('input').blur();
	});

	$('form[name="guest-form"]').submit(function(){
		var data = {
			polymerId: polymerId,
			name: $('input[name="guest_name"]'),
			surname: $('input[name="guest_surname"]'),
			fathername: $('input[name="guest_fathername"]'),
			phonenumber: $('input[name="guest_phone"]')
		}

		$.ajax({
			url: '/order',
			type: 'POST',
			data: data,
			success: function(result) {
				$(this).parent().parent().slideUp();
				$('#buyer').slideDown();
				$('#buyer').children('h2').text(result.message);
				setTimeout(function (){
					$('#buyer').slideUp();
					$('.hover').css("opacity" , "0.1");
					$('.hover').css("z-index" , "0");
				}, 2000);
			}
		});
	});

}); //onload closed

var polymerId;

function buyFunc(elem) {
	var data = {
		polymerId: $(elem).parent().attr('name')
	}
	if ($(elem).text() == "Приобрести") {
		$.ajax({
			url: '/order',
			type: 'POST',
			data: data,
			success: function(result) {
				$('#buyer').slideDown();
				$('.hover').css("opacity" , "0.8");
				$('.hover').css("z-index" , "2");
				$('#buyer').children('h2').text(result.message);
				setTimeout(function (){
					$('#buyer').slideUp();
					$('.hover').css("opacity" , "0.1");
					$('.hover').css("z-index" , "0");
				}, 2000);
			}
		});
	} else {
		$('#buyer_guest').slideDown();
		polymerId = data.polymerId;
		$('.hover').css("opacity" , "0.8");
		$('.hover').css("z-index" , "2");
	}
}

function polymersList(result) {
	$('#product_list').children().not('#title-row').remove();
	$.each(result , function (index){
			$('#product_list').append(
				'<div class="row polimers-row" name="' + result[index].PolymerId + '"><span>'+result[index].Mark+'</span> <span>'+result[index].CompanyName+'</span> <span>'+result[index].PolymerPrice+'</span> <span>'+result[index].Usings+'</span> <span>'+result[index].Color+'</span> <button type="button" onclick="buyFunc(this)" class="buy">'+$button_buy+'</button></div>');
	});
}

function selectChange(elem) {
	$(elem).parent().parent().children('input[type="text"]').val($(elem).text());
	$(elem).parent().parent().children('input[type="text"]').attr('id' , $(elem).attr('id'));
}

function cancelHider(elem){
	$(elem).parent().parent().removeClass("flex");
	$(elem).parent().parent().parent().children("span").show();
};

function openHider(elem) {
	$(elem).parent().children('span').hide();
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
	$('#bank').text("Банк: " + $cash + "$");
}

function hideProfile(elem) {
		$(elem).slideUp();
}

function selectOpen(elem) {
	if ($(elem).parent().children('.option-group').css("display") == "none")
		$(elem).parent().children('.option-group').slideDown();
	else $(elem).parent().children('.option-group').slideUp();
}

function selectClose(elem) {
		$(elem).parent().children('.option-group').slideUp();
}

function ajaxSelect(name) {
	$.ajax({
		url: '/catalog/polymers/' + name,
		type: 'GET',
		success: function(result) {
			console.log(result);
			$.each(result , function (index){
				$('#' + name).append('<div class="option" id="' + result[index].elemid + '" onclick="selectChange(this)">' + result[index].elemval + '</div>');
			});
		}
	});
}
