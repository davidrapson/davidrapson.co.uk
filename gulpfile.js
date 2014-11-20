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
var hashFiles = require('hash-files'),
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


function stringSrc(filename, string) {
    var src = require('stream').Readable({ objectMode: true });
    src._read = function () {
        this.push(new plugins.util.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
        this.push(null)
    };
    return src;
}


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
        paths.css + '/less/head.less',
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
 * Version
 * Build a version file to be used in Jekyll _data
 * Saves duplicating version number
 */
gulp.task('version', function () {
    var obj = {
        "version": pkg.version,
        "head": {
            "hash": hashFiles.sync({ files: [ paths.css + '/head.min.css' ] })
        },
        "style": {
            "hash": hashFiles.sync({ files: [ paths.css + '/style.min.css' ] })
        }
    }
    var stream = stringSrc('assets.json', JSON.stringify(obj))
        .pipe(gulp.dest( '_data' ));
    return stream;
});

/**
 * Copy head.css
 */
gulp.task('headCSS', function () {
    var stream = gulp.src([
        paths.css + '/head.min.css',
    ]).pipe(gulp.dest( '_includes' ));
    return stream;
});


/**
 * Assets
 */
gulp.task('assets', ['css', 'headCSS', 'js', 'version'], function () {
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
gulp.task('jekyll', ['css', 'headCSS', 'js'], function() {
    require('child_process').spawn('jekyll', ['build', '--drafts', '--future'], {stdio: 'inherit'});
});
gulp.task('jekyll:production', ['css', 'headCSS', 'js'], function() {
    require('child_process').spawn('jekyll', ['build'], {stdio: 'inherit'});
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
        '_drafts/**',
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
gulp.task('build', ['jekyll']);
gulp.task('default', [ 'jekyll', 'serve', 'watch']);
