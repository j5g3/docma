module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			docs : [ 'build' ]
		},

		jshint: {
			docs: {
				options: { jshintrc: '.jshintrc' },
				src: [
					'src/infer.js'
				]
			}
		},

		concat: {
			options: {
				//banner: grunt.file.read('src/banner.txt'),
				stripBanners: true
			},

			docs: {
				src: [
					'node_modules/j5g3.jsdoc-parser/jsdoc-parser.js',
					'<%= jshint.docs.src %>'
				],
				dest: 'build/docma.js'
			},
		},

		uglify: {
			docs: {
				compress: true,
				files: {
					'build/docma.js': 'build/j5g3.docma.min.js'
				}
			}
		},

		watch: {
			docs: {
				files: '<%= jshint.docs.src %>',
				tasks: [ 'jshint:docs' ]
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
