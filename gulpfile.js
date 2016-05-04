'use strict';

const gulp = require('gulp');
const through2 = require('through2').obj;
const File = require('vinyl');
const eslint = require('gulp-eslint');
const fs = require('fs');
// const stylus = require('gulp-stylus');
// // const concat = require('gulp-concat');
// const sourcemaps = require('gulp-sourcemaps');
// // const debug = require('gulp-debug');
const gulpIf = require('gulp-if');
// const del = require('del');
// // const autoprefixer = require('gulp-autoprefixer');
// // const remember = require('gulp-remember');
// // const cached = require('gulp-cached');
// // const path = require('path');
// const browserSync = require('browser-sync').create();
// const notify = require('gulp-notify');
// const plumber = require('gulp-plumber');
// const multipipe = require('multipipe');
 const combine = require('stream-combiner2').obj;//нужен объектный поток ???

// const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// gulp.task('styles', function () {
// 	return combiner(
// 		gulp.src('frontend/styles/main.styl'),
// 		// .pipe(plumber({
// 		// 	errorHandler: notify.onError(function (err) {
// 		// 		return {
// 		// 			title: 'Styles',
// 		// 			message: err.message
// 		// 		}
// 		// 	})
// 		// }))
// 		gulpif(isDevelopment, sourcemaps.init()),
// 		stylus(),
// 		gulpif(isDevelopment, sourcemaps.write()),
// 		gulp.dest('public')
// 	).on('error', notify.onError());
// });

// // gulp.task('styles', function() {

// //   	return gulp.src('frontend/styles/**/*.css')
// //       .pipe(cached('styles'))
// //       .pipe(autoprefixer())
// //       .pipe(remember('styles'))
// //       .pipe(concat('all.css'))
// //       .pipe(gulp.dest('public'));

// // });

// gulp.task('clean', function () {
// 	return del('public');
// });

// gulp.task('assets', function () {
// 	return gulp.src('frontend/assets/**', {since: gulp.lastRun('assets')})
// 		.pipe(gulp.dest('public'));
// });

// gulp.task('watch', function () {
// 	gulp.watch('frontend/styles/**/*.*', gulp.series('styles'));
// 	gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));
// });




// // gulp.task('watch', function() {

// //   gulp.watch('frontend/styles/**/*.css', gulp.series('styles')).on('unlink', function(filepath) {
// //     remember.forget('styles', path.resolve(filepath));
// //     delete cached.caches.styles[path.resolve(filepath)];
// //   });

// // });

// // gulp.task('dev', gulp.series('styles', 'watch'));
// gulp.task('server', function () {
// 	browserSync.init({
// 		server: 'public'
// 	});

// 	browserSync.watch('public/**/*.*').on('change', browserSync.reload);
// });

// gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'assets')));


// gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));


//Плагины

// gulp.task('assets', function () {

// 	const mtimes = {};

// 	return gulp.src('frontend/assets/**/*.*')
// 		.pipe(through2(function (file, enc, callback) {
// 			// let file2 = file.clone();
// 			// file2.path += '.bak';
// 			// this.push(file2);
// 			// callback(null, file);

// 			mtimes[file.relative] = file.stat.mtime;
// 			callback(null, file);
// 		},
// 		function (callback) {
// 			let manifest = new File({
// 				//cwd base path contents
// 				contents: new Buffer(JSON.stringify(mtimes)),
// 				base: process.cwd(),
// 				path: process.cwd() + '/manifest.json'
// 			});
// 			manifest.isManifest = true;
// 			this.push(manifest);
// 			callback();
// 		}
// 		))
// 		.pipe(gulp.dest(function (file) {
// 			if (file.isManifest) {
// 				return process.cwd();
// 			} else {
// 				return 'public';
// 			}
// 		}));
// })
//
// 10
//


gulp.task('lint', function() {

  let eslintResults = {};

  let cacheFilePath = process.cwd() + '/tmp/lintCache.json';

  try {
    eslintResults = JSON.parse(fs.readFileSync(cacheFilePath));
  } catch (e) {
  }

  return gulp.src('./frontend/**/*.js', {read: false})
      .pipe(gulpIf(
          function(file) {
            return eslintResults[file.path] && eslintResults[file.path].mtime == file.stat.mtime.toJSON();
          },
          through2(function(file, enc, callback) {
            file.eslint = eslintResults[file.path].eslint;
            callback(null, file);
          }),
          combine(
              through2(function(file, enc, callback) {
                file.contents = fs.readFileSync(file.path);
                callback(null, file);
              }),
              eslint(),
              //debug({title: 'eslint'}),
              through2(function(file, enc, callback) {
                eslintResults[file.path] = {
                  eslint: file.eslint,
                  mtime: file.stat.mtime
                };
                callback(null, file);
              })
          )
      ))
      .pipe(eslint.format())
      .on('end', function() {
        fs.writeFileSync(cacheFilePath, JSON.stringify(eslintResults));
      })
      .pipe(eslint.failAfterError());

});
