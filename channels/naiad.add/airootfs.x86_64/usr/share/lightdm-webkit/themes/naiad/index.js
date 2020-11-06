"use strict";

window.onload = function() {
	const clockRoot = document.getElementById('clock-root');
	const loginBoxRoot = document.getElementById('login-box-root');

	function login() {
		let passwd = passwdInput.value;

		if (passwd != "") {
			passwdInput.classList.add('hidden');
			passwdInput.classList.remove('shake');
			passwdInput.blur();

			loginButton.innerText = "Logging in...";
			loginButton.disabled = true;

			lightdm.respond(passwd);
		}
	}

	const loginButtonContainer = document.getElementById('login-button-container');

	const loginButton = document.getElementById('login-button');
	loginButton.addEventListener('click', function(e) {
		login();
	});

	const passwdInput = document.getElementById('password-input');
	passwdInput.addEventListener('input', function(e) {
		if (e.target.value.length > 0) {
			loginButtonContainer.classList.remove('hidden');
		} else {
			loginButtonContainer.classList.add('hidden');
		}
	}, false);

	function hideClock() {
		clockRoot.classList.add('hidden');
		loginBoxRoot.classList.remove('hidden');
		wallpaperImg.classList.add('zoomed');

		startShowClockTimer();
	}

	function showClock() {
		settingsContainer.classList.add('hidden');
		loginBoxRoot.classList.add('hidden');

		setTimeout(function() {
			wallpaperImg.classList.remove('zoomed');

			setTimeout(function() {
				clockRoot.classList.remove('hidden');

				setTimeout(function() {
					passwdInput.value = "";
				}, 500);
			}, 250);
		}, 250);
	}

	let showClockTimer = null;

	function startShowClockTimer() {
		if (showClockTimer)
			clearTimeout(showClockTimer);

		showClockTimer = setTimeout(function() {
			showClock();
		}, 30000);
	}

	const time = document.getElementById('time');
	const date = document.getElementById('date');

	const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	function updateTime() {
		const now = new Date();

		time.innerText = now.getHours() + '.' + now.getMinutes().toString().padStart(2, '0');
		date.innerText = weekdays[now.getDay()] + ' ' + now.getDate() + '. ' + months[now.getMonth()];
	}

	setInterval(updateTime, 2000);

	updateTime();

	window.addEventListener('keydown', function(e) {
		hideClock();
		passwdInput.focus();
	}, false);

	window.addEventListener('mousedown', function(e) {
		hideClock();
	}, false);

	window.addEventListener('mousemove', function(e) {
		startShowClockTimer();
	}, false);

	passwdInput.addEventListener('keyup', function(e) {
		if (e.keyCode === 13) {
			login();
		}
	}, false);

	window.authentication_complete = function() {
		if (lightdm.is_authenticated) {
			fade.classList.remove('hidden');

			setTimeout(function() {
				lightdm.start_session(selectedSession);
			}, 1000);
		} else {
			passwdInput.classList.remove('hidden');
			passwdInput.classList.add('shake');
			setTimeout(function() {
				passwdInput.classList.remove('shake');
			}, 800);

			loginButton.innerText = "Login";
			loginButton.disabled = false;

			switchUser(selectedUser);
		}
	}

	const fade = document.getElementById('fade');

	const shutdownButton = document.getElementById('shutdown-button');
	shutdownButton.addEventListener('click', function(e) {
		lightdm.shutdown();
	}, false);

	const rebootButton = document.getElementById('reboot-button');
	rebootButton.addEventListener('click', function(e) {
		lightdm.restart();
	}, false);

	const settingsButton = document.getElementById('settings-button');
	settingsButton.addEventListener('click', function(e) {
		settingsContainer.classList.toggle('hidden');

		if (!wallpapersLoaded) {
			loadWallpapers();
		}
	}, false);

	const userList = document.getElementById('users');

	let selectedUser = localStorage.selectedUser || lightdm.users[0].username;

	function switchUser(username) {
		selectedUser = username;
		localStorage.selectedUser = selectedUser;

		for (let button of userButtons) {
			if (button.dataset.userName === selectedUser) {
				button.classList.add('selected');
			} else {
				button.classList.remove('selected');
			}
		}

		lightdm.authenticate(username);
	}

	let selectedLoggedIn = false;
	for (let user of lightdm.users) {
		userList.innerHTML += '<button class="user-button' + (user.username === selectedUser ? ' selected' : '') + '" data-user-name="' + user.username + '" data-user-display-name="' + user.display_name + '">' + user.display_name + '</button>';

		if (user.logged_in && (!selectedLoggedIn || user.username === localStorage.selectedUser)) {
			selectedUser = user.username;
			selectedLoggedIn = true;
		}
	}

	const userButtons = document.querySelectorAll('.user-button');
	for (let button of userButtons) {
		button.addEventListener('click', function(e) {
			switchUser(button.dataset.userName);
			passwdInput.value = "";
			loginButtonContainer.classList.add('hidden');
		}, false);
	}

	const sessionSelectButton = document.getElementById('session-select');
	sessionSelectButton.addEventListener('click', function(e) {
		sessionSelectPopup.classList.toggle('hidden');
		e.stopPropagation();
	}, false);

	document.addEventListener('click', function(e) {
		sessionSelectPopup.classList.add('hidden');
	}, false);

	const sessionSelectText = document.getElementById('session-name');
	const sessionSelectPopup = document.getElementById('session-select-popup');

	let selectedSession = localStorage.selectedSession || lightdm.sessions[0].key;

	for (let session of lightdm.sessions) {
		sessionSelectPopup.innerHTML += '<button class="select-button" data-session-key="' + session.key + '" data-session-name="' + session.name + '">' + session.name + '<div class="select-description">' + session.key + '</div></button>';

		if (session.key === selectedSession) {
			sessionSelectText.innerText = session.name;
		}
	}

	const sessionButtons = document.querySelectorAll('.session-select-popup .select-button');
	for (let button of sessionButtons) {
		button.addEventListener('click', function(e) {
			selectedSession = button.dataset.sessionKey;
			localStorage.selectedSession = selectedSession;

			sessionSelectPopup.classList.add('hidden');
			sessionSelectText.innerText = button.dataset.sessionName;

			e.stopPropagation();
		}, false);
	}

	function findImages(dirList) {
		let images = [];
		const subdirs = [];

		for (let file of dirList) {
			if (!file.includes('.')) {
				subdirs.push(file);
			} else {
				let lowercaseFile = file.toLowerCase();
				if (lowercaseFile.endsWith('.png') || lowercaseFile.endsWith('.jpg') || lowercaseFile.endsWith('.gif') || lowercaseFile.endsWith('.bmp')) {
					images.push(file);
				}
			}
		}

		for (let dir of subdirs) {
			Array.prototype.push.apply(images, findImages(theme_utils.dirlist(dir)));
		}

		return images;
	}

	function switchWallpaper(wallpaper) {
		selectedWallpaper = wallpaper;
		localStorage.selectedWallpaper = selectedWallpaper;

		addToResourceStack(function(callback) {
			wallpaperImg.onload = function(e) {
				fade.classList.add('hidden');
				callback();
			};
			wallpaperImg.onerror = function(e) {
				fade.classList.add('hidden');
				callback();
			};
			wallpaperImg.src = selectedWallpaper;
		});
	}

	const settingsContainer = document.getElementById('settings-root');

	const resourceLoadStack = [];

	function loadNextResource() {
		if (resourceLoadStack.length > 0) {
			resourceLoadStack[0](function() {
				resourceLoadStack.splice(0, 1);
				loadNextResource();
			});
		}
	}

	function addToResourceStack(func) {
		resourceLoadStack.push(func);

		if (resourceLoadStack.length === 1) {
			loadNextResource();
		}
	}

	const wallpaperImg = document.getElementById('wallpaper');
	const wallpaperSwitcer = document.getElementById('wallpaper-switcher');

	const wallpapersDir = greeter_config.branding.background_images;
	let wallpapers = findImages(theme_utils.dirlist(wallpapersDir));

	for (let img of wallpapers) {
		wallpaperSwitcer.innerHTML += '<img class="wallpaper-icon" data-img-path="' + img + '">';
	}

	let selectedWallpaper;
	switchWallpaper(localStorage.selectedWallpaper || wallpapers[0]);

	const wallpaperIcons = document.querySelectorAll('.wallpaper-icon');

	let wallpapersLoaded = false;
	function loadWallpapers() {
		for (let img of wallpaperIcons) {
			addToResourceStack(function(callback) {
				img.onload = function(e) {
					img.addEventListener('click', function(e) {
						switchWallpaper(e.target.dataset.imgPath);
					});

					callback();
				};
				img.onerror = callback;
				img.src = img.dataset.imgPath;
			});
		}

		wallpapersLoaded = true;
	}

	switchUser(selectedUser);
};
