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
        factory(exports, require('j5g3.inference').Inference, root);
    } else {
        factory(/** @type {object} */root.j5g3, root.j5g3.Inference, root);
    }
}(this, function (exports, Inference, window) {
	'use strict';

	function extend(A, B)
	{
		for (var i in B)
			if (B.hasOwnProperty(i))
				A[i] = B[i];

		return A;
	}

	/**
	 * Documentation Generator for Javascript.
	 *
	 */
	function Docma(p)
	{
		extend(this, p);

		this.inference = this.inference || new Inference({
			debug: this.debug
		});
		this._linkCache = {};
	}

	Docma.prototype = {

		/// Use to test whether or not all files are done processing.
		waiting: 0,

		addFileURL: function(file)
		{
		var
			me = this,
			xhr = new window.XMLHttpRequest(),
			onload = function() {
				file.source = xhr.responseText;
				delete file.url;

				me.waiting--;
				me.addFile(file);
				me.checkReady();
			}
		;
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
				this.inference.compile(file, source);
			else if (file.url)
			{
				this.waiting++;
				this.addFileURL(file);
			} else
				this.inference.compile(file.name, file.source);
		},

		/**
		 * Generates a LIVE documentation page.
		 */
		live: function(options)
		{
		var
			me = this,
			doc = window.document,
			div = doc.createElement('DIV'),
			node, script,
			ready = function() {
				options.full = false;
				div.innerHTML = me.generate(options);

				while (div.children.length)
				{
					node = div.children[0];

					if (node.tagName==='SCRIPT')
					{
						script = doc.createElement('SCRIPT');
						script.innerHTML = node.innerHTML;
						doc.body.appendChild(script);
						div.removeChild(node);
					} else
						doc.body.appendChild(node);
				}
			}
		;
			options.files.forEach(this.addFile.bind(this));
			this.onready = ready;
			this.checkReady();
		},

		generate: function(options)
		{
			var template = (options && options.template) || Docma.template;
			options = extend({
				docma: this,
				title: '',
				full: true,
				isTagLabel: {
					class: true, namespace: true, method: true, static: true,
					deprecated: true, private: true, property: true,
					protected: true, mixin: true, setter: true, getter: true
				}
			}, options);

			options.files = this.inference.files;
			options.symbols = this.inference.getSymbols();

			return template(options);
		},

		_linkCache: null,

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

		get_icons: function(symbol)
		{
			var result = '';

			for (var i in this.icons)
				if (symbol.tags[i])
					result += this.icons[i];

			return result;
		},

		link: function(symbol, label)
		{
		var
			id=symbol.id
		;
			if (!this._linkCache[id])
				this._linkCache[id] = '<a onclick="go(this)" href="#' +
				id + '">' +	this.get_icons(symbol) + ' ';

			return this._linkCache[id] + (label||id) + '</a>';
		},

		/**
		 * Formats text.
		 */
		text: function(text)
		{
			if (text instanceof Array)
				text = text.join('</p><p>');

			var result = '<p>' + text.replace(/\n\n/g, '</p><p>') + '</p>';

			return result;
		},

		addSourceLineNumbers: function(source, prefix)
		{
		var
			l = 0,
			result = source.replace(/\n/g, function() {
				l++;
				return "\n" + '<a class="line" name="' + prefix + l + '">' + l + '</a>';
			})
		;

			return '<a class="line" name="' + prefix + '0">0</a>' + result;
		},

		/**
		 * Iterates through each symbol.
		 */
		eachSymbol: function(p, callback)
		{
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
		}

	};

	/**
	 * Creates a Docma object and call the <code>live</code> function with
	 * the specified options.
	 */
	Docma.live = function(options, docma_options)
	{
		var d = new Docma(docma_options);
		d.live(options);
		return d;
	};

	exports.Docma = Docma;

}));
