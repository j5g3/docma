/**
 * @license GPLv3
 * @author Giancarlo Bellido
 * @requires j5g3.inference
 */
(function (root, factory) {
    'use strict';

    if (typeof exports !== 'undefined')
    {
		/* global exports */
		/* global require */
        factory(exports, require('j5g3.inference').Inference, root, require('@cxl/cxl'), require('highlight.js'), require('lodash'));
    } else {
        factory(/** @type {object} */root, root.j5g3.Inference, root, root.cxl, root.hljs, root._);
    }
}(this, function (exports, Inference, window, cxl, hljs, _) {
	'use strict';

	function extend(A, B)
	{
		for (var i in B)
			if (B.hasOwnProperty(i))
				A[i] = B[i];

		return A;
	}
	
	var linkCache;

	/**
	 * Documentation Generator for Javascript.
	 *
	 */
	function Docma(p)
	{
		extend(this, p);

		this.files = [];
		this.inference = this.inference || new Inference({
			debug: this.debug
		});
	}

	Docma.prototype = {
		
		waiting: 0,
		files: null,

		addFileURL: function(file)
		{
		var
			me = this,
			xhr = new window.XMLHttpRequest(),
			onload = function() {
				file.source = xhr.responseText;
				me.waiting--;
				me.checkReady();
			}
		;
			this.waiting++;
			xhr.onload = onload;
			xhr.open('GET', file.url, true);
			xhr.send();
		},

		checkReady: function()
		{
			if (this.waiting===0)
				this.onready();
		},

		/**
		 * Adds a file to the documentation generator. If the file object
		 * contains a url property it will do an ajax request to try to get
		 * the source and will call the <code>this.onready</code> function when all
		 * files have been loaded.
		 *
		 * @param {object|string} file The file object or the file name. Properties are file, name, source.
		 * @param {string} source Source code of the file to parse. Only required if <code>file</code> is a string.
		 */
		addFile: function(file, source)
		{
			if (typeof(file)==='string')
				file = { name: file, source: source };
			else if (file.url)
				this.addFileURL(file);
			
			this.files.push(file);
		},
		
		compile: function()
		{
			this.files.forEach(function(file) {
				this.inference.compile(file.name, file.source);
			}, this);
		},
		
		initHighlight: function()
		{
			hljs.initHighlighting();
		},
		
		initElements: function()
		{
			this.$cards = cxl.id('cards');
			this.$settings = {
				view: cxl.id('settings-view input')
			};
		},
		
		start: function()
		{
			this.initElements();
			this.initHighlight();
			cxl.start();
		},

		/**
		 * Generates a LIVE documentation page.
		 */
		live: function(options)
		{
		var
			me = this,
			doc = window.document,
			ready = function() {
				me.compile();
				doc.body.appendChild(me.generate(options));
				me.start();
			}
		;
			options.files.forEach(this.addFile.bind(this));
			this.onready = ready;
			this.checkReady();
		},

		generate: function(options)
		{
			linkCache = {};
			options = extend({
				template: Docma.template,
				itemTemplate: Docma.itemTemplate,
				docma: this,
				title: '',
				full: true

			}, options);

			options.files = this.inference.files;
			options.symbols = this.inference.getSymbols();
			
			if (options.ignore)
				options.symbols = _.reject(options.symbols, function(a, k) {
					return options.ignore.test(k);
				});
			
			options.cards = Docma.mapSymbol(options.symbols, options.itemTemplate);

			return cxl.compile(options.template, options);
		}

	};

	_.extend(Docma, /** @lends Docma */ {
		
		mapSymbol: function(p, cb)
		{
			var result = [];
			
			Docma.eachSymbol(p, function(symbol, tags, value, i) {
				result.push(cb(symbol, tags, value, i));
			});
			
			return result;
		},
		
		/**
		 * Iterates through each symbol.
		 */
		eachSymbol: function(p, callback)
		{
			if (!p)
				return;
		var
			keys = Object.keys(p).sort(),
			i = 0, l=keys.length,
			symbol, tags, value
		;
			for (; i<l; i++)
			{
				symbol = p[keys[i]];
				tags=symbol.tags;
				value=symbol.value;

				if (tags.proto || tags.missing || tags.system) continue;
				callback(symbol, tags, value, i);
			}
		},
		
		link: function(symbol, label)
		{
		var
			id=symbol.id
		;
			if (!linkCache[id])
				linkCache[id] = this.get_icons(symbol) + '<a onclick="go(this)" href="#' +
				id + '">';

			return linkCache[id] + (label||id) + '</a>';
		},
		
		get_icons: function(symbol)
		{
			var result = '';

			for (var i in this.icons)
				if (symbol.tags[i])
					result += this.icons[i];

			return result;
		},
		
		/**
		 * Uses font-awesome icons by default. Determines the icon for each tag.
		 */
		icons: {
			method: '<i title="method" class="fa fa-cube"></i>',
			class: '<i title="class" class="fa fa-gear"></i>',
			namespace: '<i title="namespace" class="fa fa-cubes"></i>',
			property: '<i title="property" class="fa fa-list-alt"></i>',
			mixin: '<i title="mixin" class="fa fa-puzzle-piece"></i>',
			static: '<i title="static" class="fa fa-wrench"></i>',
			deprecated: '<i title="deprecated" class="text-danger glyphicon glyphicon-warning"></i>',
			event: '<i title="event" class="gryphicon glyphicon-flash"></i>'
		},

		/**
		 * Formats text.
		 */
		text: function(text)
		{
			if (text instanceof Array)
				text = text.join('</p><p>');

			text = _.escape(text).replace(/\n\n/g, '</p><p>');
			
			var result = '<p>' + text + '</p>';

			return result;
		},
		
		/**
		 * Creates a Docma object and call the <code>live</code> function with
		 * the specified options.
		 */
		live: function(options)
		{
			options = options || {};
			
			var d = new Docma({
				debug: options.debug
			});
			
			d.live(options);
			return d;
		},

		isTagLabel: {
			class: true, namespace: true, method: true, static: true,
			deprecated: true, private: true, property: true,
			protected: true, mixin: true, setter: true, getter: true
		}
		
	});

	exports.Docma = Docma;

}));
