#!/usr/bin/env node
"use strict";

var
	/** Default libraries */
	path = require("path"),
	fs = require("fs"),
	_ = require('underscore'),

	/* Variables */
	localDir = process.cwd(),
	ourDir = path.resolve(__dirname, ".."),
	files = [],

	/* Libraries */
	Docma = require(ourDir + '/docma.js').Docma,
	docma = new Docma(),

	// Options
	template = ourDir + '/themes/default.html',
	docname = 'docs'
;

function usage(exit)
{
  console.error("Usage: cxl-docs.js [-n doc title] [-t template] sources.js+\n");
  if (exit !== null) process.exit(exit);
}

function option(arg, i, array)
{
	switch (arg) {
	case '-h': case '--help':
		usage(1);
		break;
	case '-n': case '--name':
		docname = array.splice(i+1, 1)[0];
		break;
	case '-t': case '--template':
		template = array.splice(i+1, 1)[0];
		break;
	default:
		files.push(arg);
	}
}

process.argv.slice(2).forEach(option);

if (!files.length) return usage(1);

files.forEach(function(file) {
	console.log('Compiling ' + file + '...');
	docma.addFile(file, fs.readFileSync(file, 'utf8'));
});

template = _.template(fs.readFileSync(template, 'utf8'));

console.log(docma.generate(template, { name: docname }));
