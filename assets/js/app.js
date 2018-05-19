var app = {};

app.web = {
	init: function init() {
		app.web.users();
		app.web.chats();
	},
	users: function(){
		function setFeeds(user){
			var userJson = JSON.parse(user);
			if(userJson.displayName != null){
				$(".profile").find(".name").text(userJson.displayName);
			}else{
				$(".profile").find(".name").text("-");
			}
			if(userJson.photoURL != null){
				$(".profile").find(".avatar").attr("src", userJson.photoURL);
			}else{
				$(".profile").find(".avatar").attr("src", "assets/images/avatar.png");
			}
			
			$(".profile").find(".email").text(userJson.email);

			$(".login").hide();
			$(".feeds").show();
		}
		//check if user login / not
		var user = localStorage.getItem("chatty_user");
		if(user!=null){
			//already login
			setFeeds(user);
		}

		$(".logout-yes").click(function(){
			localStorage.removeItem('chatty_user');
			$("#logoutModal").modal('hide');

			$(".feeds").hide();
			$(".login").fadeIn();
		})

		$(".default-login-form").submit(function(){
			var errorMessage = "";
			$(".login-feedback").text('');
			var oldBtnText = $(this).find('.btn-submit').text();
			$(this).find('.btn-submit').prop("disabled", true);
			$(this).find('.btn-submit').html(loading);

			var email = $(this).find(".email").val();
			var password = $(this).find(".password").val();
			firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
				// user signed in
				localStorage.setItem("chatty_user", JSON.stringify(user));
				user = localStorage.getItem("chatty_user");

				setFeeds(user);
			 }).catch(function(error) {
				var errorCode = error.code;
				errorMessage = error.message;
				$(".login-feedback").text(errorMessage);
			});	

			$(this).find('.btn-submit').text(oldBtnText);
			$(this).find('.btn-submit').prop("disabled", false);

			return false;
		})

		$(".signup-form").submit(function(){
			$(".signup-feedback").text('');
			var oldBtnText = $(this).find('.btn-submit').text();
			$(this).find('.btn-submit').prop("disabled", true);
			$(this).find('.btn-submit').html(loading);

			var email = $(this).find(".email").val();
			var password = $(this).find(".password").val();
			firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
				// user signed up success
				localStorage.setItem("chatty_user", JSON.stringify(user));
				user = localStorage.getItem("chatty_user");

				$("#signUpModal").modal('hide');

				setFeeds(user);
			}).catch(function(error) {
				var errorCode = error.code;
				var errorMessage = error.message;
				$(".signup-feedback").text(errorMessage);
				console.log(errorCode);

				if(errorCode==null){
					//sign up success
					$("#signUpModal").modal("hide");
				}
			});
			
			$(this).find('.btn-submit').text(oldBtnText);
			$(this).find('.btn-submit').prop("disabled", false);

			return false;
		})

		//login with google
		$(".google-login").click(function(){
			var provider = new firebase.auth.GoogleAuthProvider();
			provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
			firebase.auth().signInWithPopup(provider).then(function(result) {
				// This gives you a Google Access Token. You can use it to access the Google API.
				var token = result.credential.accessToken;
				// The signed-in user info.
				var user = result.user;

				// user signed up success
				localStorage.setItem("chatty_user", JSON.stringify(user));
				user = localStorage.getItem("chatty_user");
				setFeeds(user);
				// ...
			}).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				// The email of the user's account used.
				var email = error.email;
				// The firebase.auth.AuthCredential type that was used.
				var credential = error.credential;
				console.log(errorMessage);
				// ...
			});
		})
	},
	chats: function(){
		
	}
};

$(document).ready(function () {
	app.web.init();
});

function escapeHTML(unsafe_str) {
	if (unsafe_str != null) {
		return unsafe_str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&#39;').replace(/\//g, '&#x2F;');
	}
}

function formatDateTime(dateTime) {
	dateFormatted = moment(dateTime).format('DD MMM YYYY, HH:mm');
	return dateFormatted;
}