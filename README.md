docma.js
========

Javascript documentation tool. Uses esprima for parsing and a custom
type inference[https://github.com/j5g3/inference] engine for analysis.
It supports JSDOC style comments using
j5g3.jsdoc-parser[https://github.com/j5g3/jsdoc-parser]. 

The engine is fast, and can be used to render documentation on the fly.

Supported tags:

- abstract, virtual
- alias
- author
- augments, extends
- callback
- class, constructor, constructs
- const, constant
- copyright
- deprecated
- desc
- event
- extends
- file
- global
- ignore
- lends, scope
- license
- method, property, mixin
- namespace
- param
- private, protected, public
- readonly
- requires, returns
- static
- this
- throws
- todo
- version

Installation/Build
------------------

Download/Clone the repository and then run these commands in the root folder.

	npm install
	grunt

Demo
----

[docs/index.html](http://coaxialsoftware.github.com/cxl-docs.js/docs)
	Live documentation rendering.
	
	
Command Line Tool
-----------------

bin/docma.js

Usage: docma.js [options] sources.js+

Options:

	-n --name docname          String to use as title of documentation page.
	-t --template template     Underscore template file to use.

Will output HTML to standard output. Requires node.js.