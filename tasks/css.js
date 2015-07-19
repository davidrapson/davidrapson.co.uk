var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var paths = require('./_config.json').paths;
var pkg = require('../package.json');
var reload = require('browser-sync').reload;
var path = require('path');

/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
var runSequence = require('run-sequence');

gulp.task('css', function (done) {
    return gulp.src([
        paths.styleSrc + '/head.scss',
        paths.styleSrc + '/style.scss'
    ])
        .pipe(plugins.plumber())
        // Build CSS (Sass, Source maps, AutoPrefixer)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        .pipe(plugins.sourcemaps.write())
        .pipe(plugins.autoprefixer('last 2 version', 'ie 8', 'ie 9'))
        .pipe(gulp.dest( paths.styleDest ))
        // Minify CSS
        .pipe(plugins.csso())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest( paths.styleDest ))
        // Pipe head.min.css to _includes for inlining
        .pipe(plugins.if(function(file) {
            return (path.basename(file.path) === 'head.min.css');
        }, gulp.dest( paths.sourceDir + '/_includes' )))
        // Versioned build
        .pipe(gulp.dest( paths.buildDist + '/' + pkg.version + '/stylesheets' ))
        // BrowserSync reload
        .pipe(reload({ stream:true }));
});
