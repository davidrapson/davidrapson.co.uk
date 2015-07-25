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
        .pipe(plugins.sourcemaps.init())
        // Contatenate & Minify
        .pipe(plugins.concat('combined.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest( paths.jsDest ))
        // Hash-rev
        .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest( paths.buildDistJs ))
        .pipe(plugins.rev.manifest('manifest.json', { merge: true }))
        .pipe(gulp.dest( paths.sourceDirData ));
});

gulp.task('jshint', function() {
    return gulp.src([
        'tasks/**/*.js',
        './gulpfile.js'
    ])
        .pipe(plugins.jshint({ node: true }))
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});
