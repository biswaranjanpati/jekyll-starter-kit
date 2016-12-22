/*
 Enjoy Jekyll with the streamlined optimizations of Gulp.
*/

// node modules required
var gulp = require('gulp'),
		sass = require('gulp-sass'),
		autoprefix = require('gulp-autoprefixer'),
		jsHint = require('gulp-jshint'),
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		plumber = require('gulp-plumber'),
		rename = require('gulp-rename'),
		imageMin = require('gulp-imagemin'),
		cache = require('gulp-cache'),
		del = require('del'),
    cp = require('child_process'),
		browserSync = require('browser-sync').create();

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

// jekyll child process launched
gulp.task('jekyll-build', function(done) {
  return cp.spawn(jekyll, ['build'], {stdio: 'inherit'}).on('close', done);
});

// rebuild jekyll files
gulp.task('jekyll-rebuild', ['jekyll-build'], function() {
  browserSync.reload();
});

// compile sass
gulp.task('styles', function() {
	return gulp
		.src('_assets/css/main.sass')
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(sass({outputStyle: 'expanded'}))
		.pipe(autoprefix())
		.pipe(gulp.dest('_site/assets/css'))
		.pipe(rename({suffix: '.min'}))
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(gulp.dest('_site/assets/css'))
		.pipe(browserSync.reload({stream: true}));
});

// compile javascript
gulp.task('scripts', function() {
	return gulp
		.src(['_assets/js/vendor/*', '_assets/js/*.js'])
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(jsHint())
    .pipe(jsHint.reporter('default'))
		.pipe(concat('main.js'))
    .pipe(gulp.dest('_site/assets/js'))
    .pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('_site/assets/js'))
		.pipe(browserSync.reload({stream: true}));
});

// optimize images
gulp.task('images', function() {
	return gulp
		.src('_assets/img/*.{jpg,png,svg}')
		.pipe(cache(imageMin({ optimizationLevel: 5, progressive: true, interlaced: true })))
		.pipe(gulp.dest('_site/assets/img'));
});

// icons
gulp.task('icons', function() {
	return gulp
		.src('_assets/img/icons/*')
		.pipe(gulp.dest('_site/assets/img/icons'));
});

// run primary tasks, start server, and watch files
gulp.task('serve', ['styles', 'scripts', 'images', 'icons'], function() {
	browserSync.init({
		notify: false,
		server: {
			baseDir: '_site'
		}
	});
	gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_posts/*'], ['jekyll-rebuild']);
	gulp.watch('_assets/css/**/*.{sass,scss}',['styles']);
	gulp.watch('_assets/js/**/*.js', ['scripts']);
	gulp.watch('_assets/img/*.{jpg,png,svg}', ['images']);
	gulp.watch('_assets/img/icons/*', ['icons']);
});

/*
 before production clean any extraneous files
 and folders from your assets dir by running
 "gulp clean" then rebuild with "gulp"
*/
gulp.task('clean', function() {
	return del(['_site/assets/*']);
});

// gulp default task
gulp.task('default', ['jekyll-build'], function() {
  gulp.start('serve');
});

// error handling
var onError = function (error) {
	console.log(error.message);
	this.emit('end');
};
