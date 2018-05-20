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
				$(".avatar-me").attr("src", defaultAvatar);
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

				location.reload();
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

			var username = $(this).find(".name").val();
			var email = $(this).find(".email").val();
			var password = $(this).find(".password").val();
			firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
				// user signed up success
				var user = firebase.auth().currentUser;

				user.updateProfile({
					displayName: username,
					photoURL: ""
				}).then(function() {
					localStorage.setItem("chatty_user", JSON.stringify(user));
					user = localStorage.getItem("chatty_user");
					createOrUpdateUser(user);

					$("#signUpModal").modal('hide');
					location.reload();
				}).catch(function(error) {
					alert("error occured");
				});		
			}).catch(function(error) {
				var errorCode = error.code;
				var errorMessage = error.message;
				$(".signup-feedback").text(errorMessage);
				$(".signup-form").find(".password").val('');

				if(errorCode==null){
					//sign up success
					$(".signup-form").find(".email").val('');
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
				location.reload();
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
				location.reload();
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
				location.reload();
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

		//count users
		var users = firebase.database().ref('users').orderByKey();
		users.on('value', function(snapshot) {
			$(".total-users").find('.count').html(loading);
			$(".user-list").html('');
			var totalUsers = 0;
			snapshot.forEach(function(childSnapshot){
				totalUsers++;
				var user = childSnapshot.val();

				//check photo url
				var avatar = "";
				if(user.profile_picture!=null){
					avatar = user.profile_picture;
				}else{
					avatar = defaultAvatar;
				}
				$(".user-list").append('<tr><td width="80px"><img src="'+avatar+'" class="rounded-circle img-fluid"/></td><td><div class="name">'+escapeHTML(user.username)+'</div><div class="email">'+escapeHTML(user.email)+'</div></td></tr>');
			});
			$(".total-users").find('.count').text(totalUsers);
			$(".total-results").text(totalUsers);
		});

		//filter user
		$("#filterUsers").on("keyup", function() {
			var value = $(this).val().toLowerCase();
			var total = 0;
			$(".user-list tr").filter(function() {
				$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
				if($(this).text().toLowerCase().indexOf(value) > -1){
					total++;
				}
			});
			$(".total-results").text(total);
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
		$(".feeds-loading").html("Loading feeds<br/>"+loading);

		//subscribing feeds
		var postings = firebase.database().ref('postings');
		postings.on('value', function(snapshot) {
			$(".feeds-loading").show();
			$(".feeds-list").html('');

			var feeds = [];

			snapshot.forEach(function(childSnapshot){
				var feed = childSnapshot.val();

				//get user
				var userPromise = firebase.database().ref('users/'+childSnapshot.val().userId).once('value', function(userSnapshot) {
					return userSnapshot.val();
				});

				var user = userPromise.then(function(data){
					feed.userPhotoURL = data.val().profile_picture;
					feed.username = data.val().username;
					feed.email = data.val().email;
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

					//check photo url
					var avatar = "";
					if(post.userPhotoURL!=null){
						avatar = post.userPhotoURL;
					}else{
						avatar = defaultAvatar;
					}

					var feeds = "<div class='box'><div class='row'><div class='col-1' style='padding-right:0px;'><a href='#' data-toggle='tooltip' title='"+post.email+"'><img src='"+avatar+"' class='rounded-circle avatar img-fluid'/></a></div><div class='col-10'><div class='username'><a href='#' data-toggle='modal' data-target='#userModal' data-name='"+post.username+"' data-email='"+post.email+"' data-avatar='"+avatar+"' class='view-user'>"+escapeHTML(post.username)+"</a></div><div class='posted-date'>"+responseDate+"</div></div></div><div class='row'><div class='col-12'>"+escapeHTML(post.postText)+"<div></div></div>";
					$(".feeds-list").append(feeds);
				});

				$(".feeds-loading").hide();
			}, 500);
		});

		$(document).on('click', '.view-user', function(){
			$('.user-profile').find('.avatar').attr("src", $(this).data('avatar'));
			$('.user-profile').find('.name').text($(this).data('name'));
			$('.user-profile').find('.email').text($(this).data('email'));
		})

		$(".post-form").submit(function(){
			//get user
			var user = firebase.auth().currentUser;
			if (user) {
				// User is signed in.
				var postDate = moment.utc().toDate();
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
	$('[data-toggle="tooltip"]').tooltip(); 
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