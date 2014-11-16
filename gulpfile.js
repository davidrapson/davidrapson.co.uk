/**
 * gulpfile.js
 */

/**
 * Shhh…
 */
var secrets = require('./secrets.json');

/**
 * Require stdlibs
 */
var spawn = require('child_process').spawn;


/**
 * Require gulp & plugins
 */
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')();


/**
 * Define common paths
 */
var paths = {
    css: 'static/css',
    js: 'static/js'
};


/**
 * CSS
 */
gulp.task('css', function () {
    var stream = gulp.src( paths.css + '/less/style.less' )
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer('last 2 version', 'ie 8', 'ie 9'))
        .pipe(gulp.dest( paths.css ))
        .pipe(plugins.cssmin())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest( paths.css ));
    return stream;
});


/**
 * JavaScript
 */
gulp.task('js', function () {
    var stream = gulp.src([ paths.js + '/app.js' ])
        .pipe(plugins.plumber())
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.concat('app.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest( paths.js + '/min/' ));
    return stream;
});


/**
 * Jekyll
 */
gulp.task('jekyll', ['css', 'js'], function() {
    var stream = spawn('bundle', ['exec', 'jekyll', 'build', '--drafts', '--future']);
    return stream;
});


/**
 * Watch
 */
gulp.task('watch', function() {
    gulp.watch( paths.css + '/less/**/*.less', ['css']);
    gulp.watch( paths.js + '/**/*.js', ['js']);
    gulp.watch([
        paths.css + '/**',
        '_layouts/**',
        '_includes/**',
        '_posts/**',
        'index.html'
    ], ['jekyll']);
});


/**
 * Webserver w/livereload
 */
gulp.task('serve', function() {
    gulp.src('_site/')
        .pipe(plugins.webserver({
            livereload: true,
            open: true
        }));
});


/**
 * Deployment
 */
gulp.task('deploy', ['jekyll'], function() {
    gulp.src('_site/**')
        .pipe(plugins.sftp({
            host: secrets.servers.production.hostname,
            user: secrets.servers.production.username,
            remotePath: secrets.servers.production.destination,
            passphrase: secrets.servers.production.passphrase
        }));
});

/**
 * Default task
 */
gulp.task('default', ['serve', 'watch']);
