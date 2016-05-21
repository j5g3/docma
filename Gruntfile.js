module.exports = function(grunt) {

	var _ = require('lodash');
	var template = "Docma.template =" +
		_.template(grunt.file.read('themes/default.html')).source.toString() +
		"\n; Docma.itemTemplate =" +
		_.template(grunt.file.read('themes/item-default.html')).source.toString()
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
					'node_modules/@cxl/cxl/dist/cxl.js',
					'node_modules/j5g3.inference/build/inference.js',
					'node_modules/highlight.js/lib/highlight.js',
					//'node_modules/highlight.js/lib/languages/javascript.js',
					'<%= jshint.docma.src %>'
				],
				dest: 'build/docma.js'
			},
			
			css: {
				src: [
					'node_modules/@cxl/cxl/dist/cxl.css'
				],
				dest: 'build/docma.css'
			}
		},

		uglify: {
			docma: {
				compress: true,
				files: {
					'build/docma.min.js': 'build/docma.js'
				}
			}
		},

		watch: {
			docma: {
				files: ['<%= jshint.docma.src %>', 'themes/*.html' ],
				tasks: [ 'jshint:docma' ]
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [ 'jshint', 'clean', 'concat' ]);
	grunt.registerTask('minify', [ 'default', 'uglify' ]);
};
