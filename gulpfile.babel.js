let production = false;

import gulp from 'gulp';
import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import vue from 'rollup-plugin-vue';

import clean from 'gulp-clean';
import sass from 'gulp-sass';
import imagemin from 'gulp-imagemin';
import rename from 'gulp-rename';
import gulpif from 'gulp-if';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import fs from 'fs';
import bump from 'gulp-bump';
import runSequence from 'run-sequence';
import { argv } from 'yargs';

const reload = browserSync.reload;
const config = {
  src: './src/assets',
  public: './public',
};

const tasks = ['images', 'styles', 'scripts'];

gulp.task('scripts', ['clean-scripts'], () => {
  rollup({
    // BUG: https://github.com/rollup/rollup-plugin-node-resolve/issues/43
    entry: 'src/assets/scripts/app.js',
    plugins: [
      vue(),
      nodeResolve({
        jsnext: true,
      }),
      commonjs(),
      babel({
        babelrc: false, // rollup needs it's own preset.
        presets: ['es2015-rollup'],
        exclude: 'node_modules/**',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        'process.env.VUE_ENV': JSON.stringify('browser'),
      }),
    ],
  }).then(bundle => {
    bundle.write({
      format: 'iife',
      sourceMap: gulpif(!production, true, false),
      dest: `${config.public}/scripts/scripts.min.js`,
    });
  }).catch(err => console.log(err.stack));
});

gulp.task('clean-styles', () => (
  gulp.src(`${config.public}/styles`, { read: false })
  .pipe(clean())
));

gulp.task('clean-scripts', () => (
  gulp.src(`${config.public}/scripts`, { read: false })
  .pipe(clean())
));

gulp.task('browser-sync', () => {
  browserSync.init(null, {
    proxy: 'http://pilgrimist.dev',
    files: [`${config.public}/**/*.*`],
    browser: 'google chrome',
    port: 7000,
  });
});

gulp.task('watch', () => {
  gulp.watch(`${config.src}/styles/**/*.scss`, ['styles', reload]);
  gulp.watch(`${config.src}/scripts/**/*.js`, ['scripts', reload]);
  gulp.watch(`${config.src}/images/**/*.*`, ['images', reload]);
});

gulp.task('styles', () => (
  gulp.src(`${config.src}/styles/*.scss`)
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(sass({
      outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(gulpif(!production, sourcemaps.write('.')))
    .pipe(gulp.dest(`${config.public}/styles`))
));

gulp.task('images', () => {
  gulp.src(`${config.src}/images/**/*.*`)
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{ removeViewBox: false }],
  }))
  .pipe(gulp.dest(`${config.public}/images`));
});

gulp.task('getversion', () => {
  const version = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
  return version;
});

gulp.task('bump', () => {
  let type = 'patch';
  if (argv.minor) type = 'minor';
  if (argv.major) type = 'major';

  return gulp.src('./package.json')
    .pipe(bump({ type }))
    .pipe(gulp.dest('./'));
});

gulp.task('dev', () => (
  runSequence('clean-styles', 'clean-scripts', tasks, 'browser-sync', 'watch')
));

gulp.task('build', () => {
  production = true;
  return runSequence('clean-styles', 'clean-scripts', 'bump', 'getversion', tasks);
});

gulp.task('default', () => (
  runSequence('clean-styles', 'clean-scripts', tasks)
));
