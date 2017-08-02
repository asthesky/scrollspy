

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var header = require('gulp-header');
var del = require('del');
var chalk = require('chalk');
// 
var pkg = require('./package.json');
pkg.time = new Date().toISOString();
// 
var config = {
  distPath: './dist',
  distCssPath: './dist/css',
  headerTmpl: `/**
* name: <%= pkg.name %>
* version: <%= pkg.version %>
* author: <%= pkg.author %>
* time: <%= pkg.time %>
*/
`,
  minifyName: 'scrollspy'
}

gulp.task('clear', function (callback) { //清理
  return del(['./build/*'], callback);
});
gulp.task('cssmin', function (callback) {
  gulp.src('./src/**/*.css')
    .pipe(minify({
      compatibility: 'ie7'
    }))
    .pipe(gulp.dest(config.distCssPath)).on('finish', callback);
});

gulp.task('jsmin', function (callback) {
  gulp.src('./src/**.js').pipe(uglify())
    .pipe(header(config.headerTmpl, { pkg: pkg }))
    .pipe(rename(function (path) {
      path.basename = config.minifyName + '.min';
    }))
    .pipe(gulp.dest(config.distPath)).on('finish', callback);
});

gulp.task('default', ['clear', 'cssmin', 'jsmin'], function () {
  console.log(chalk.white.bgGreen.bold(' Build Complete.\n'));
});





