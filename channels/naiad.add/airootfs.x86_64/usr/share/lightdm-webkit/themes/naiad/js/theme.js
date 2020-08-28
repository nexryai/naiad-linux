/* This is sample front end code, uses the facilities provided by LoginManager
to easily create a login manager without having to deal with specific
implementation details. LoginManager uses jQuery events to wrap the
standard lightdm interface */

/* add a black box to hide enverything while its still loading,
this will be removed after LoginManager triggers its 'ready' event. */
var $cover = $(`<div id="block" style="position: absolute;
background-color: black;width: 100%; height: 100vh; z-index:9999;"></div>`);

$(document).ready(() => {
	$("body").append($cover);
});

// create singleton
const greeter = new LoginManager();

// called after greeter and lightdm are initialized
$(greeter).on("ready", function(e) {

	let $user = $("#selectUser");
	let $session = $("#selectSession");
	let $password = $("#inputPassword");


	/*User the LoginManager's facility for easily filling the user
	selection boxes and binding the appropriate
	listeners needed by materialize */
	greeter.fillUserSelect($user);
	greeter.fillSessionSelect($session);



	/* Bind shutdown, restart hibernate and suspend to the
	appropriate buttons */
	$("#buttonPoweroff").click(function() {
		greeter.shutdown();
	});
	$("#buttonRestart").click(function() {
		greeter.restart();
	});
	$("#hibernate").click(function() {
		greeter.hibernate();
	});

	// Bind listener to the password box
	$password.keydown((e) => {
		// user has typed, remove placeholder and invalid class
		$password.prop("placeholder", "").removeClass("invalid");

		/* Attempt authentication, 'grant' event will be emitted on sucecss
		and 'deny' will be emitted on failure */
		if (e.keyCode == 13) {
			if(!$("#inputPassword").val() == ""){
				// $("body").addClass("gaussfade-out");
				let username = $user.children("option:selected").val();
				let pass = $password.val();
				greeter.auth(username, pass);
			}
		}
		
		else if (e.keyCode==65 && e.ctrlKey) {
			$('#inputPassword').select();
		}
		console.log(e.ctrlKey);

	});

	// when the user is authenticated, do a transition and login
	$(greeter).on("grant", () => {
		let session_key = $session.children("option:selected").val();
		greeter.login(session_key)
		// $cover.fadeIn("slow", () => greeter.login(session_key));
	})
	.on("deny", () => {
		// inform the user that the credentials are invalid
		$password.removeClass("valid").addClass("invalid");
		$password.val("").prop("placeholder", "Incorrect Password");
		// setTimeout('$("body").removeClass("gaussfade-out")', 2000);
	});

	$(greeter.plugins.SplashScreen).on("active", function() {
		$(".active-appear").fadeIn();
	}).on("inactive", function() {
		$(".active-appear").fadeOut();
	});


	/* Once everything else has loaded, its  safe to remove the black screen
	hiding the dom. Do it async so that all currently running async
	functions have a chance to complete */
	setTimeout(() => $cover.fadeOut(), dur=1);
});
