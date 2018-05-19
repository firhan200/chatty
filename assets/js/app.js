var app = {};

app.web = {
	init: function init() {
		app.web.users();
		app.web.feeds();
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
				$(".avatar-me").attr("src", userJson.photoURL);
			}else{
				$(".avatar-me").attr("src", "assets/images/avatar.png");
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
			firebase.auth().signOut().then(function() {
				// Sign-out successful.
				localStorage.removeItem('chatty_user');
				$("#logoutModal").modal('hide');

				$(".feeds").hide();
				$(".login").fadeIn();
			  }).catch(function(error) {
				// An error happened.
				console.log(error);
			  });		
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
				createOrUpdateUser(user);
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

		//login with facebook
		$(".facebook-login").click(function(){
			var provider = new firebase.auth.FacebookAuthProvider();
			firebase.auth().signInWithPopup(provider).then(function(result) {
				// This gives you a Facebook Access Token. You can use it to access the Facebook API.
				var token = result.credential.accessToken;
				// The signed-in user info.
				var user = result.user;
				// user signed up success
				localStorage.setItem("chatty_user", JSON.stringify(user));
				user = localStorage.getItem("chatty_user");
				createOrUpdateUser(user);
				setFeeds(user);
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
		});

		//login with github
		$(".github-login").click(function(){
			var provider = new firebase.auth.GithubAuthProvider();
			firebase.auth().signInWithPopup(provider).then(function(result) {
				// This gives you a Facebook Access Token. You can use it to access the Facebook API.
				var token = result.credential.accessToken;
				// The signed-in user info.
				var user = result.user;
				// user signed up success
				localStorage.setItem("chatty_user", JSON.stringify(user));
				user = localStorage.getItem("chatty_user");
				createOrUpdateUser(user);
				setFeeds(user);
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
		});

		function createOrUpdateUser(user){
			var userJson = JSON.parse(user);
			firebase.database().ref('users/' + userJson.uid).set({
				username: userJson.displayName,
				email: userJson.email,
				profile_picture : userJson.photoURL
			});
		}
	},
	feeds: function(){
		$(".feeds-loading").html(loading);

		//subscribing feeds
		var postings = firebase.database().ref('postings').orderByKey();
		postings.on('value', function(snapshot) {
			$(".feeds-loading").show();
			$(".feeds-list").html('');

			var feeds = [];

			snapshot.forEach(function(childSnapshot){
				var feed = childSnapshot.val();

				//get users
				var userPromise = firebase.database().ref('users/'+childSnapshot.val().userId).once('value', function(userSnapshot) {
					return userSnapshot.val();
				});

				var user = userPromise.then(function(data){
					feed.userPhotoURL = data.val().profile_picture;
					feed.username = data.val().username;
				});

				feeds.push(feed);
			});

			setTimeout(function(){
				//sorted desc
				var feedsSorted = feeds.reverse();

				$.each(feedsSorted, function(key, post){
					//console.log(post.username);
					var postDate = new Date(post.postedDate);
					var responseDate = moment(postDate).fromNow();
					var feeds = "<div class='box'><div class='row'><div class='col-1' style='padding-right:0px;'><img src='"+post.userPhotoURL+"' class='rounded-circle avatar img-fluid'/></div><div class='col-10'><div class='username'>"+post.username+"</div><div class='posted-date'>"+responseDate+"</div></div></div><div class='row'><div class='col-12'>"+post.postText+"<div></div></div>";
					$(".feeds-list").append(feeds);
				});

				$(".feeds-loading").hide();
			}, 500);
		});

		$(".post-form").submit(function(){
			//get user
			var user = firebase.auth().currentUser;
			if (user) {
				// User is signed in.
				var postDate = new Date();
				var id = postDate.getTime();
				var postText = $(this).find(".post-text").val();
				firebase.database().ref('postings/' + id).set({
					userId: user.uid,
					postText: postText,
					postedDate: postDate.toString()
				});

				$(this).find(".post-text").val('');
			} else {
				// No user is signed in.
				alert("user not login");
			}	

			return false;
		})
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