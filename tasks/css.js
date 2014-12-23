var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var paths = require('../config').paths;

gulp.task('css', function () {
    return gulp.src([
        paths.styleSrc + '/head.scss',
        paths.styleSrc + '/style.scss'
    ])
        .pipe(plugins.plumber())
        // Lint CSS
        .pipe(plugins.scssLint({
            'config': '.scss-lint.yml',
            'bundleExec': true
        }))
        // Build CSS
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        .pipe(plugins.sourcemaps.write())
        .pipe(plugins.autoprefixer('last 2 version', 'ie 8', 'ie 9'))
        .pipe(gulp.dest( paths.styleDest ))
        // Minify CSS
        .pipe(plugins.csso())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest( paths.styleDest ))
        // Versioned build
        .pipe(gulp.dest( paths.buildVersion + '/stylesheets' ));
});

gulp.task('css:head', ['css'], function () {
    return gulp.src([
        paths.styleDest + '/head.min.css',
    ]).pipe(gulp.dest( '_includes' ));
});