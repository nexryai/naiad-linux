/**
 * Provides facilities for using lightdm-webkit2 interface.
 * Allows custom plugins to created and dynamicly loaded (see SplashScreen.js)
 *
 * For Basic Usage see:
 *  auth(username="", password="", callback)
 * 	login(session_key)
 *
 * NOTE: Uses the Logger class for debugging purposes
 */
class LoginManager {
		constructor() {
			this._DEF_LM = {
				"plugins": [
					"SplashScreen"
				]
			}
			this.plugins = {};
			this._plugins = this._DEF_LM.plugins; // map of plugin objects

			// begin intializing once the DOM has finished loading
			$(document).ready(() => {

				/* read config file, use defaults on failure, since config is in JSON
				reading mut be async */
				$.getJSON("json/LoginManager.json", (data) => {
					if (Array.isArray(data.plugins)) {
						this._plugins = data.plugins;
					}
					this._init();
				}).fail((e) => {
					log.warn("Could not load LoginManager config, using defaults instead");
					this._init();
				});

			});
		}

		/****************** Private Implementation Functions **********************/

		/**
		 * Creates each plugin listed in the user config
		 * triggerd by 'init' event (which is called after the DOM has loaded)
		 */
		_init() {
			this.lightdm = (typeof lightdm == "undefined") ? {} : lightdm;

			/* Instantiate all plugins using the config file. Plugins will be
			constructed by using the string in the following manner
			LoginManagerObj.plugins[str] = new [str]()
			The login manager will hold references to this using the same string
			identifier as seen above */
			let ready_count = 0;
			for (let name of this._plugins) {

				if (this._plugins.length == 0) { // no plugins skip
					$(this).trigger("ready");
					return;
				}

				// use plugin name to instantiate objects
				this.plugins[name] = eval("new " + name + "()");
				let $plugin =  $(this.plugins[name]);
				/* listen to each plugins 'ready' event, once this equals the number of
				 		plugins available, trigger ready on the login manager */
				$plugin.on("ready", () => {
					ready_count ++;
					if (ready_count == this._plugins.length)
					$(this).trigger("ready");
				});
				/* listen to the 'load' event, this means that the plugin has loaded
					Allows of its resources */
				$plugin.on("load", () => $plugin.trigger("init"));

			}
		}

		/*************************** Public Functions *****************************/

		/**
		* Asyncrhonously authenticates a user
		* Wrapper function for to simplify lightdm's authentication protocol
		* if provided callback is given the authentication result as a boolean
		* argument
		*
		*	Triggers the the following events:
		*    - grant on success
		*    - deny on failure
		*/
		auth(username="", password="", callback) {

			if (!this.lightdm) {
				log.warn("Cannot attempt login because lightdm is missing the " +
				"required fields. Please note that lightdm is not explicitly " +
				"instantiated in a browser session.");

				// call async so that events can be binded in cascade
				setTimeout(() => $(this).trigger("deny"));
				if (typeof callback == "function")
				callback(this.lightdm.is_authenticated);
				return;
			}

			/* Create callbacks, these will be called by lightdm as a responses to
			  	lightdm.authenticate() and lightdm.respond() */
			let auth_cb = () =>  { // called as a result of authenticate
				this.lightdm.respond(password);
			}
			let auth_complete_cb = () => { // called as a result of respond
        try { // attempt to cache selcted username
          localStorage.setItem("user", username);
        } catch(e) {};

				if (typeof callback == "function")
				    callback(this.lightdm.is_authenticated);

				$(this).trigger(this.lightdm.is_authenticated ? "grant" : "deny");
			}
			/* lightdm will call these two functions, so override them so we can
					govern the desired behaivour */
			window.show_prompt = auth_cb;
			window.authentication_complete = auth_complete_cb;

			if (!this.lightdm.authenticate) {
				log.error("lightdm does not contain authenticate");
				$(this).trigger("deny");
				return;
			}
			this.lightdm.authenticate(username); // this will trigger auth_cb
		}

		/**
		 * Will start the sessions once a user is authenticated.
		 * Wrapper function for lightdm.start_session_sync()
		 *
		 * Should be called after this.auth() Provides additonal error checking.
		 */
		login(session_key) {
			if (!this.lightdm.sessions.find((x) => x.key == session_key)) {
				log.error("Attempting to login without a valid session.");
				return;
			}

			if (!this.lightdm.is_authenticated) {
				log.error("Attempting to login without authentication.");
				return;
			}
      log.normal(`storing:: ${session_key}`);

      // store selected options in the cache
      try {
        localStorage.setItem("session", session_key);
      } catch(e) {};

      this.lightdm.start_session_sync(session_key);
		}

		/**
		 * Provide facilities to easily fill selection boxes given a jQuery selected
		 * object.
		 *
		 * Automatically removes expired entries from select dropdown and handles
     * caching
		 */
		fillUserSelect($el) {
			if (!Array.isArray(this.lightdm.users)) {
				log.warn("No users to fill in lightdm's list.");
				return;
			}

			$el.empty();
			for (let s of this.lightdm.users)
			   $el.append("<option value=" + s.username + ">" + s.display_name + "</option>");

        // use cache values if available
       try  {
         let prev = localStorage.getItem("user");
         // make sure the stored user is valid
         let user = this.lightdm.sessions.find((x) => x.username == prev)
         if (user)
            $el.val(user.username);
       } catch (e) {}

			$el.formSelect();
		}
		fillSessionSelect($el) {
			if (!Array.isArray(this.lightdm.sessions)) {
				log.warn("No sessions to fill in lightdm's list.");
				return;
			}
			$el.empty();
			for (let s of this.lightdm.sessions)
    			$el.append("<option value=" + s.key + ">" + s.name + "</option>");

       // use cache values if available
       try  {
         let prev = localStorage.getItem("session");
         // make sure the stored session is valid
         let session = this.lightdm.sessions.find((x) => x.name == prev);

         if (session)
            $el.val(session.name);
       } catch (e) {}

			$el.formSelect();
		}

		/**
		 * Wrapper functions for lightdm power buttons.
		 * Provides additional error checking
		 */
		shutdown() {
			if (this.lightdm.can_shutdown)
			this.lightdm.shutdown();
			else  {
				log.error("Do not have permission to shutdown");
				return -1;
			}

		}
		restart() {
			if (this.lightdm.can_restart)
			this.lightdm.restart();
			else  {
				log.error("Do not have permission to restart");
				return -1;
			}

		}
		hibernate() {
			if (this.lightdm.can_hibernate)
			this.lightdm.hibernate();
			else {
				log.error("Do not have permission to hibernate");
				return -1;
			}
		}
		suspend() {
			if (this.lightdm.can_suspend)
			this.lightdm.suspend();
			else {
				log.error("Do not have permission to suspend");
				return -1;
			}
		}

		/**
		 * shorthand lightdm user & session object lists
		 */
		get users() {
			return this.lightdm.users;
		}
		get sessions() {
			return this.lightdm.sessions;
		}
}
