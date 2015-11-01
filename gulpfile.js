var gulp = require('gulp');
var compilerPath = require.resolve('google-closure-compiler')
    .replace(/\/package\.json$/, '/');
var compiler = require('gulp-closure-compiler');
var del = require('del');
var connect = require('gulp-connect');
var mkdirp = require('mkdirp');

gulp.task('clean', function() {
	del.sync('./dist');
});

gulp.task('build', ['clean'], function() {
  mkdirp.sync('./dist');

  return gulp.src('./src/**/*.js')
      .pipe(compiler({
        compilerPath: compilerPath + 'compiler.jar',
        fileName: 'geolocationmarker.js',
        compilerFlags: {
          compilation_level: 'ADVANCED',
          warning_level: 'VERBOSE',
          externs: compilerPath + 'contrib/externs/maps/google_maps_api_v3.js',
          language_in: 'ECMASCRIPT6_STRICT',
          language_out: 'ECMASCRIPT5_STRICT',
          create_source_map: './dist/geolocationmarker.js.map'
        }
      }))
      .pipe(gulp.dest('./dist'));
});

gulp.task('test', function () {
  connect.server({
    livereload: false,
    port: 7777
  });
});

gulp.task('default', ['build']);
