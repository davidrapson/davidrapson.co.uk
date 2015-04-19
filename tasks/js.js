var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var paths = require('../config').paths;
var pkg = require('../package.json');

gulp.task('js', ['jshint'], function () {
    return gulp.src([
        paths.jsSrc + '/components/picturefill/dist/picturefill.min.js',
        paths.jsSrc + '/components/lazysizes/lazysizes.min.js',
        paths.jsSrc + '/main.js'
    ])
        .pipe(plugins.plumber())
        // Contatenate & Minify
        .pipe(plugins.concat('combined.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest( paths.jsDest ))
        // Versioned build
        .pipe(gulp.dest( paths.buildDist + '/' + pkg.version + '/javascripts' ));
});

gulp.task('jshint', ['jshint:dev'], function() {
    return gulp.src([
        paths.jsSrc + '/app.js'
    ])
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('jshint:dev', function() {
    return gulp.src([
        'lib/*.js',
        'tasks/*.js',
        './gulpfile.js'
    ])
        .pipe(plugins.jshint({
            node: true
        }))
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});
