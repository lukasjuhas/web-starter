var production = false;

var gulp = require('gulp'),
    argv = require('yargs').argv,
    sourcemaps = require('gulp-sourcemaps'),
    gulpif = require('gulp-if'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    fs = require('fs'),
    sass = require('gulp-sass'),
    clean = require('gulp-clean'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync'),
    rename = require('gulp-rename'),
    streamify = require('gulp-streamify'),
    runSequence = require('run-sequence'),
    imagemin = require('gulp-imagemin'),
    bump = require('gulp-bump');

var reload = browserSync.reload;

var config = {
  dest:   './dist',
  src:    './src',
  build:  './build'
};

var tasks = ['images', 'scripts', 'styles', 'html', 'move'];

gulp.task('scripts', function() {
  return gulp.src('./src/scripts/**/*.js')
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(babel())
    .pipe(concat('app.min.js'))
    .pipe(gulpif(production, uglify().on('error', function(e){
      console.log(e);
    })))
    .pipe(gulpif(!production, sourcemaps.write('.')))
    .pipe(gulp.dest(gulpif(production, config.build, config.dest) + '/scripts'))
});

gulp.task('styles', function () {
  return gulp.src('./src/styles/*.scss')
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulpif(!production, sourcemaps.write('.')))
    .pipe(gulp.dest(gulpif(production, config.build, config.dest) + '/styles'))
});

gulp.task('images', function() {
  gulp.src('./src/images/**/*.*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
    }))
    .pipe(gulp.dest(gulpif(production, config.build, config.dest) + '/images'))
});

gulp.task('watch', function () {
  browserSync({
    notify: false,
    logPrefix: 'BS',
    server: [config.dest]
  });
  gulp.watch('./src/styles/**/*.scss', ['styles', 'html', reload]);
  gulp.watch('./src/*.html', ['html', reload]);
  gulp.watch('./src/images/**/*.*', ['images', reload]);
});

gulp.task('html', ['styles'], function() {
  return gulp.src(config.src + '/*.html')
  .pipe(replace(/<link href="styles\/core.min.css"[^>]*>/, function(s) {
      var style = fs.readFileSync(gulpif(production, config.build, config.dest) + '/styles/core.min.css', 'utf8');
      return '<style>\n' + style + '\n</style>';
  }))
  .pipe(gulp.dest(gulpif(production, config.build, config.dest)))
});

gulp.task('clean', function () {
  var stream = gulp.src(gulpif(production, config.build, config.dest), {read: false})
    .pipe(clean());
  return stream;
});

gulp.task('move', ['clean'], function(){
  gulp.src([config.src + '/*.html'])
  .pipe(gulp.dest(gulpif(production, config.build, config.dest)));
});

gulp.task('getversion', function() {
  version = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
});

gulp.task('bump', function() {
  var type = 'patch';
  if(argv.minor) type = 'minor';
  if(argv.major) type = 'major';

  return gulp.src('./package.json')
    .pipe(bump({type: type}))
    .pipe(gulp.dest('./'));
});

gulp.task('dev', function() {
  return runSequence('clean', tasks, 'watch');
});

gulp.task('build', function() {
  production = true;
  return runSequence('clean', 'bump', 'getversion', tasks);
});

gulp.task('default', function() {
  return runSequence('clean', tasks);
});
