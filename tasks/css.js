'use strict';

var path = require('path');
var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins');
var pkg = require('../package.json');

const plugins = gulpPlugins();
const paths = pkg.config.buildPaths;

const isHeadCss = file => (path.basename(file.path) === 'head.css');

gulp.task('css', function () {
    return gulp.src([
        `${paths.styleSrc}/head.scss`,
        `${paths.styleSrc}/style.scss`
    ])
        .pipe(plugins.plumber())
        // Build CSS (Sass, Source maps, AutoPrefixer)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        .pipe(plugins.autoprefixer('last 2 version', 'ie 8', 'ie 9'))
        .pipe(plugins.csso())
        .pipe(gulp.dest(paths.styleDest))
        // Pipe head.min.css to _includes for inlining
        .pipe(plugins.if(isHeadCss, gulp.dest(`${paths.sourceDir}/_includes`)))
        // Hash-rev
        .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.buildDistCss))
        .pipe(plugins.rev.manifest('stylesheets.json'))
        .pipe(gulp.dest(paths.sourceDirData));
});
