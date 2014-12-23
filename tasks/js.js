var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var paths = require('../config').paths;

gulp.task('js', ['jshint'], function () {
    return gulp.src([
        paths.jsSrc + '/components/picturefill/dist/picturefill.min.js',
        paths.jsSrc + '/components/lazysizes/lazysizes.min.js'
    ])
        .pipe(plugins.plumber())
        .pipe(plugins.concat('combined.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest( paths.jsDest ))
        .pipe(gulp.dest( paths.buildVersion + '/javascripts' ));
});

gulp.task('jshint', function() {
    return gulp.src([
        'lib/*.js',
        './gulpfile.js',
        paths.jsSrc + '/app.js'
    ])
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});
