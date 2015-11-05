var gulp = require('gulp');
var compilerPath = require.resolve('google-closure-compiler')
    .replace(/\/package\.json$/, '/');
var compiler = require('gulp-closure-compiler');
var fs = require('fs');
var connect = require('gulp-connect');
var replace = require('gulp-replace');
var packageInfo = require('./package.json');

gulp.task('clean', function() {
  try {
    fs.unlinkSync('./geolocationmarker.js');
    fs.unlinkSync('./geolocationmarker.js.map');
  } catch (e) { }
});

gulp.task('compile', ['clean'], function() {
  return gulp.src('./src/**/*.js')
      .pipe(compiler({
        compilerPath: compilerPath + 'compiler.jar',
        fileName: 'geolocation-marker.js',
        compilerFlags: {
          compilation_level: 'ADVANCED',
          warning_level: 'VERBOSE',
          externs: compilerPath + 'contrib/externs/maps/google_maps_api_v3.js',
          language_in: 'ECMASCRIPT6_STRICT',
          language_out: 'ECMASCRIPT5_STRICT',
          create_source_map: './geolocation-marker.js.map',
          output_wrapper: '(function(){%output%}).call(this)\n//# sourceMappingURL=geolocation-marker.js.map'
        }
      }))
      .pipe(replace(/^ geolocation-marker$/m, ' geolocation-marker version ' + packageInfo.version))
      .pipe(gulp.dest('./'));
});

gulp.task('copy', function() {
  return gulp.src('./support/bower.json', {base: './support'})
      .pipe(gulp.dest('./'));
});

gulp.task('build', ['compile', 'copy']);

gulp.task('test', function () {
  connect.server({
    livereload: false,
    port: 7777
  });
});

gulp.task('default', ['build']);
