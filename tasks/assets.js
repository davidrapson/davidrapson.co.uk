'use strict';

var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins');
var pkg = require('../package.json');

var plugins = gulpPlugins();
var paths = pkg.config.buildPaths;

gulp.task('images', function () {
    return gulp.src(paths.publicImages + '/**')
        .pipe(plugins.imagemin({progressive: true}))
        .pipe(gulp.dest(paths.publicImages));
});
