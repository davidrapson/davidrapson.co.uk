var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var paths = require('./_config.json').paths;
var pkg = require('../package.json');

gulp.task('js', ['jshint'], function () {
    return gulp.src([
        paths.jsSrc + '/components/picturefill/dist/picturefill.min.js',
        paths.jsSrc + '/components/lazysizes/lazysizes.min.js'
    ])
        .pipe(plugins.plumber())
        // Contatenate & Minify
        .pipe(plugins.concat('combined.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest( paths.jsDest ))
        // Versioned build
        .pipe(gulp.dest( paths.buildDist + '/' + pkg.version + '/javascripts' ));
});

gulp.task('jshint', function() {
    return gulp.src([
        'tasks/**/*.js',
        './gulpfile.js'
    ])
        .pipe(plugins.jshint({ node: true }))
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});
