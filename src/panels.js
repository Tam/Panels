(function (window) {

	/**
	 * Helpers
	 */
	var Helpers = {
		mergeObject: function (a, b) {
			var c = {}, attrname;
			for (attrname in a) {
				if (a.hasOwnProperty(attrname))
					c[attrname] = a[attrname];
			}
			for (attrname in b) {
				if (b.hasOwnProperty(attrname))
					c[attrname] = b[attrname];
			}
			return c;
		}
	};

	/**
	 * Ajax
	 * TODO: new Ajax(opts) (can set endpoint), return current Ajax func
	 *
	 * @param {object} opts - Options
	 * @constructor
	 */
	var Ajax = function (opts) {
		// TODO: Implement using a promise (native w/ polyfill https://github.com/stefanpenner/es6-promise)
		// TODO: Get ajax progress % for loading bar
		// TODO: Add option to include middleware (i.e. auth check)
		var self = this;
		this.options = Helpers.mergeObject(Ajax._defaults, opts);

		// Format body
		var body = this.options.body;
		if (body) body = (["DOMString", "String", "Blob", "ArrayBuffer", "ArrayBufferView", "Document", "Text", "FormData"].indexOf(body.constructor.name) > -1) ? body : JSON.stringify(body);

		// Open Request
		var req = new XMLHttpRequest();
		req.open(this.options.method, this.options.url, true);

		// Set Content Type
		if (this.options.body.constructor.name === "Blob") {
			if (body.type) req.setRequestHeader("Content-Type", body.type);
		} else if (this.options.body.constructor.name === "Document") {
			if (body.contentType) req.setRequestHeader("Content-Type", body.contentType);
		} else if (this.options.body.constructor.name === "FormData") {
			req.setRequestHeader("Content-Type", "multipart/form-data");
		} else if (this.options.body.constructor.name === "Object") {
			req.setRequestHeader("Content-Type", "application/json");
		} else if (["String", "Text"].indexOf(this.options.body.constructor.name) > -1) {
			req.setRequestHeader("Content-Type", "text/plain");
		}

		// User defined headers (can override Content-Type)
		for (var key in this.options.headers) {
			if (this.options.headers.hasOwnProperty(key))
				req.setRequestHeader(key, options.headers[key]);
		}

		// On Error Callback // TODO: Replace w/ promise
		req.onerror = function () {
			if (self.options.error)
				self.options.error(req);
		};

		// On Load Callback // TODO: Replace w/ promise
		req.onload = function () {
			// TODO: add global & local callbacks for status codes
			// self.callback[req.status]();

			if (req.status >= 200 && req.status < 400) {
				if (self.options.success)
					self.options.success(req, JSON.parse(req.responseText));
			} else {
				if (self.options.error)
					self.options.error(req, JSON.parse(req.responseText));
			}
		};

		// Send
		if (body) req.send(body);
		else req.send();
	};

	Ajax._defaults = {
		method: 'GET',
		url: '',
		body: null,
		headers: {},
		success: function () {},
		error: function () {}
	};

	/**
	 * Panels
	 *
	 * @param {object} opts - Options Object
	 * @constructor
	 */
	var Panels = function (opts) {
		// Options
		this.options = Helpers.mergeObject(Panels._defaults, opts);

		// Router
		this.router = new Grapnel();

		// Ajax
		this.ajax = Ajax;

		// Pass self to Panel
		this.Panel.prototype.app = this;

		if (this.options.debug && window.console) {
			this.log = function (type) {
				var args = ["%cPanels:%c", "font-weight:bold;", "font-weight:normal;"],
					a = Array.prototype.slice.call(arguments);
				a.shift();
				args = args.concat(a);
				console[type].apply(console, args);
			};

			try {
				console.log.apply(console, [
					"%c %c %c %c  Panels %c| v" + Panels.version + "  %c %c %c" +
					"\n%c Vue:     %c" + (typeof window.Vue !== "undefined") +
					"\n%c Grapnel: %c" + (typeof window.Grapnel !== "undefined"),

					"background:rgba(180,214,65,0.3);padding-top:2px;padding-bottom:2px;",
					"background:rgba(180,214,65,0.6);padding-top:2px;padding-bottom:2px;",
					"background:rgba(180,214,65,0.8);padding-top:2px;padding-bottom:2px;",
					"color:#ffffff;background:rgba(180,214,65,1);font-weight:bold;padding-top:2px;padding-bottom:2px;",
					"color:#ffffff;background:rgba(180,214,65,1);padding-top:2px;padding-bottom:2px;",
					"background:rgba(180,214,65,0.8);padding-top:2px;padding-bottom:2px;",
					"background:rgba(180,214,65,0.6);padding-top:2px;padding-bottom:2px;",
					"background:rgba(180,214,65,0.3);padding-top:2px;padding-bottom:2px;",

					"color:#ccc;line-height:2em;",
					"color:" + (typeof window.Vue === "undefined" ? "red" : "orange") + ";font-weight:bold;",

					"color:#ccc;",
					"color:" + (typeof window.Grapnel === "undefined" ? "red" : "orange") + ";font-weight:bold;"
				]);
			} catch (e) {}
		} else {
			this.log = function () {};
		}
	};

	// Version
	Panels.version = '0.0.1';

	// Default Options
	Panels._defaults = {
		debug: false,
		baseEl: document.body,
		preload: false
	};


	/**
	 * Panel
	 *
	 * @param {object} opts  - Options
	 * @param {object} v     - Vue Options
	 * @param {object} logic - Panel Logic
	 * @constructor
	 */
	var Panel = function (opts, v, logic) {
		this.options = Helpers.mergeObject(Panel._defaults, opts);

		if (this._verifyOpts()) {
			// Template
			if (this.app.options.preload)
				this._storeTemplate();

			// Route
			// TODO: Add route to Panels

			// Vue
			this.v = new Vue(v);

			// Logic
			this.logic = logic;
		}
	};

	// Default Options
	Panel._defaults = {
		parentEl: null,
		route: null, // TODO: Remove Route from config into Panels main or arg
		template: null,
		templateUrl: null,
		append: false,
		appendChild: false,
		templateLogic: false,
		tag: 'div'
	};

	/**
	 * Verify the settings
	 *
	 * @returns {boolean}
	 * @private
	 */
	Panel.prototype._verifyOpts = function () {
		var o = this.options,
			valid = true;

		// Template
		if (o.template === null && o.templateUrl === null) {
			valid = false;
			this.app.log('error', 'You must define a Template or TemplateUrl');
		}

		if (o.template !== null && (!(o.template instanceof HTMLElement) || typeof o.template !== "string")) {
			valid = false;
			this.app.log('error', 'Template set to unknown type', '"' + typeof o.template + '"');
		}

		if (o.templateUrl !== null && typeof o.templateUrl !== "string") {
			valid = false;
			this.app.log('error', 'TemplateUrl set to unknown type', '"' + typeof o.templateUrl + '"');
		}

		// TODO: Finish

		return valid;
	};

	/**
	 * Store the template
	 */
	Panel.prototype._storeTemplate = function () {
		if (this.options.templateUrl !== null) {
			var req = new XMLHttpRequest(),
				self = this;
			req.open('GET', this.options.templateUrl, true);
			req.onload = function () {
				if (req.status >= 200 && req.status < 400) {
					// TODO: Get template (& logic) from file
					self.template = document.createElement(self.options.tag);
					self.template.innerHTML = req.responseText;
				} else {
					self.app.log('error', "Unable to load template file:", self.options.templateUrl);
				}
			};
			req.send();
		} else {
			this.template = document.createElement(this.options.tag);
			this.template.innerHTML = this.options.template;
		}
	};

	// Panel Events
	// Open
	Panel.prototype.onOpen = function () {
		// Ensure we have a template
		if (typeof this.template === "undefined")
			this._storeTemplate();

		if (this.template) {
			var parent = this.options.parentEl ? this.options.parentEl : this.app.options.baseEl;

			if (this.options.append) {
				parent.innerHTML += this.template.innerHTML;
			} else if (this.options.appendChild) {
				if (parent.getElementsByTagName('panel-output')) {
					parent.getElementsByTagName('panel-output')[0].appendChild(this.template);
				} else {
					parent.appendChild(this.template);
				}
			} else {
				// TODO: Store currently open panel (allow for multiple levels (based off route) -1 means ignore (i.e. modals))
				// this.app.panels[currentLevel].close(); // Loop through children and close them first
				parent.innerHTML = this.template.innerHTML;
			}

			if (typeof this.logic.onOpen === "function")
				this.logic.onOpen();
		}
	};

	// Close
	Panel.prototype.onClose = function () {
		if (typeof this.logic.onClose === "function")
			this.logic.onClose();
	};

	// Panel Controls
	Panel.prototype.open = function () {
		this.onOpen();
	};

	Panel.prototype.close = function () {
		this.onClose();
	};

	// Add to Panels
	Panels.prototype.Panel = Panel;

	// Export
	window.Panels = Panels;

})(window);