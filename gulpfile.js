var gulp = require('gulp'),
	sourcemaps = require('gulp-sourcemaps'),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	jshint = require("gulp-jshint");

gulp.task('minify', function () {
	gulp.src(['src/**/*.js'])
		.pipe(sourcemaps.init())
		.pipe(jshint())
		.pipe(jshint.reporter())
		.pipe(uglify().on('error', function(err){ console.log(err.message); }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
	gulp.watch(['src/**/*.js'], ['minify']);
});

gulp.task('default', ['watch']);