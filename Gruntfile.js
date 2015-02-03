module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-curl');

  grunt.task.registerTask('setup-env', 'Create intermediate build directories', function () {
    grunt.file.mkdir('build');
    grunt.file.copy('node_modules/google-closure-tools-latest/bin/compiler.jar', 'build/compiler.jar');
    if (!grunt.file.exists('build/google_maps_api_v3.js')) {
      grunt.task.run('curl:google_maps_api_externs');
    }
  });

  grunt.initConfig({
    clean: {
      build: {
        src: ['build', 'dist']
      }
    },
    curl: {
      google_maps_api_externs: {
        src : 'https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/maps/google_maps_api_v3.js',
        dest: 'build/google_maps_api_v3.js'
      }
    },
    'closure-compiler': {
      deploy: {
        closurePath: '.',
        js: [
          'lib/**/*.js',
          'src/**/*.js',
          'build/**/*.js'],
        jsOutputFile: 'dist/geolocationmarker-compiled.js',
        maxBuffer: 500,
        noreport: true,
        options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT',
          warning_level: 'VERBOSE',
          use_types_for_optimization: undefined,
          only_closure_dependencies: undefined,
          closure_entry_point: 'GeolocationMarker.exports',
          output_wrapper: '(function(){%output%\n}).call(window)\n//# sourceMappingURL=geolocationmarker-compiled.js.map',
          create_source_map: 'dist/geolocationmarker-compiled.js.map',
          jscomp_error: [
            'accessControls',
            'ambiguousFunctionDecl',
            'checkEventfulObjectDisposal',
            'checkRegExp',
            'checkStructDictInheritance',
            'checkTypes',
            'checkVars',
            'conformanceViolations',
            'const',
            'constantProperty',
            'deprecated',
            'es3',
            'es5Strict',
            'externsValidation',
            'globalThis',
            'inferredConstCheck',
            'internetExplorerChecks',
            'invalidCasts',
            'misplacedTypeAnnotation',
            'missingProperties',
            'missingProvide',
            'missingRequire',
            'missingReturn',
            'newCheckTypes',
            'suspiciousCode',
            'typeInvalidation',
            'undefinedNames',
            'undefinedVars',
            'unknownDefines',
            'uselessCode',
            'useOfGoogBase',
            'visibility'
          ]
        }
      }
    },
    connect: {
      main: {
        options: {
          port: 7777,
          base: '.',
          keepalive: true,
          open: 'http://localhost:7777/test/example.html'
        }
      }
    }
  });

  grunt.registerTask('deploy', ['clean', 'setup-env', 'closure-compiler' ]);
  grunt.registerTask('default', ['deploy']);
  grunt.registerTask('test', ['deploy', 'connect']);
};
