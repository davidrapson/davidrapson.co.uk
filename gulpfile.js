/**
 * gulpfile.js
 */

/**
 * Shhh…
 */
var pkg = require('./package.json');
var secrets = require('./secrets.json');


/**
 * Require gulp & plugins
 */
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')();


/**
 * Require additional npm modules
 */
var spawn = require('child_process').spawn,
    del = require('del');


/**
 * Define common paths
 */
var paths = {
    'static': 'static',
    'css': 'static/css',
    'js': 'static/js',
    'build': 'static/dist',
    'buildVersion': 'static/dist/' + pkg.version
};


/**
 * Clean
 */
gulp.task('clean', function() {
    del([ paths.build + '/**' ]);
});


/**
 * CSS
 */
gulp.task('css', ['clean'], function () {
    var stream = gulp.src([
        paths.css + '/less/style.less',
        paths.css + '/less/pygments.less'
    ])
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer('last 2 version', 'ie 8', 'ie 9'))
        .pipe(gulp.dest( paths.css ))
        .pipe(plugins.cssmin())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest( paths.css ))
        .pipe(gulp.dest( paths.buildVersion + '/css' ))
    return stream;
});


/**
 * JavaScript
 */
gulp.task('js', ['clean'], function () {
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
 * Assets
 */
gulp.task('assets', ['css', 'js'], function () {
    var aws = {
        key: secrets.aws.key,
        secret: secrets.aws.secret,
        bucket: secrets.aws.bucket,
        region: secrets.aws.region
    };
    var stream = gulp.src([ paths.build + '/**' ])
        .pipe(plugins.gzip())
        .pipe(plugins.s3(aws, {
            headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' },
            gzippedOnly: true
        }));
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
        '*.html'
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
gulp.task('deploy', ['jekyll', 'assets'], function() {
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
gulp.task('build', ['css', 'js']);
gulp.task('default', ['serve', 'watch']);
