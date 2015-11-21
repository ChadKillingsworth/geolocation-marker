var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var compiler = require('google-closure-compiler');
var closureCompilerGulp = compiler.gulp();

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
  return gulp.src('./src/**/*.js', {base: './'})
      .pipe(sourcemaps.init())
      .pipe(closureCompilerGulp({
          compilation_level: 'ADVANCED',
          warning_level: 'VERBOSE',
          externs: compiler.compiler.CONTRIB_PATH + '/externs/maps/google_maps_api_v3.js',
          language_in: 'ECMASCRIPT6_STRICT',
          language_out: 'ECMASCRIPT5_STRICT',
          output_wrapper: '(function(){\n%output%\n}).call(this)',
          js_output_file: 'geolocation-marker.js'
        }))
      .pipe(replace(/^ geolocation-marker$/m, ' geolocation-marker version ' + packageInfo.version))
      .pipe(sourcemaps.write('/'))
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
