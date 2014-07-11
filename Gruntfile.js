module.exports = function(grunt) {

	var _ = require('underscore');
	var template = "j5g3.Docma.template =" +
		_.template(grunt.file.read('themes/default.html')).source.toString()
	;

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			docma: [ 'build' ]
		},

		jshint: {
			docma: {
				options: { jshintrc: '.jshintrc' },
				src: [
					'docma.js'
				]
			}
		},

		concat: {
			options: {
				//banner: grunt.file.read('src/banner.txt'),
				stripBanners: true,
				footer: template
			},

			docma: {
				src: [
					'node_modules/esprima/esprima.js',
					'node_modules/underscore/underscore.js',
					'node_modules/j5g3.inference/node_modules/j5g3.jsdoc-parser/jsdoc-parser.js',
					'node_modules/j5g3.inference/inference.js',
					'<%= jshint.docma.src %>'
				],
				dest: 'build/docma.js'
			},
		},

		uglify: {
			docma: {
				compress: true,
				files: {
					'build/docma.js': 'build/j5g3.docma.min.js'
				}
			}
		},

		watch: {
			docma: {
				files: '<%= jshint.docma.src %>',
				tasks: [ 'jshint:docma' ]
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [ 'jshint', 'concat' ]);
	grunt.registerTask('minify', [ 'default', 'clean', 'uglify' ]);
};
