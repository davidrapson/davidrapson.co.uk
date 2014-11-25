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

var runSequence = require('run-sequence');    // Temporary solution until gulp 4
                                              // https://github.com/gulpjs/gulp/issues/355

/**
 * Require additional npm modules
 */
var hashFiles = require('hash-files'),
    versiony = require('versiony'),
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
gulp.task('css', [ 'css:head' ], function () {
    var stream = gulp.src([
        paths.css + '/less/head.less',
        paths.css + '/less/style.less',
        paths.css + '/less/print.less'
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
gulp.task('js', ['lint'], function () {
    var stream = gulp.src([
        paths.js + '/components/picturefill/dist/picturefill.min.js',
        paths.js + '/app.js'
    ])
        .pipe(plugins.plumber())
        .pipe(plugins.concat('app.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest( paths.js + '/min' ))
        .pipe(gulp.dest( paths.buildVersion + '/js' ));
    return stream;
});

gulp.task('lint', function() {
    var stream = gulp.src([
        paths.js + '/app.js'
    ])
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    return stream;
});

/**
 * Version
 * Build a version file to be used in Jekyll _data
 * Saves duplicating version number
 */
gulp.task('version', function () {
    // Sync version from package.json to bower.json
    versiony.from('./package.json').to('./bower.json')
    // Write new assets.json manifest
    var stream = stringSrc('assets.json', JSON.stringify({
        "version": pkg.version,
        "head": {
            "hash": hashFiles.sync({ files: [ paths.css + '/head.min.css' ] })
        },
        "style": {
            "hash": hashFiles.sync({ files: [ paths.css + '/style.min.css' ] })
        }
    })).pipe(gulp.dest( '_data' ));
    return stream;
});

/**
 * Copy head.css
 */
gulp.task('css:head', function () {
    var stream = gulp.src([
        paths.css + '/head.min.css',
    ]).pipe(gulp.dest( '_includes' ));
    return stream;
});


/**
 * Minify Images
 */
 gulp.task('imagemin', function () {
    var dir = '_site/images/output';
    return gulp.src( dir + '/**' )
        .pipe(plugins.imagemin({
            progressive: true
        })).pipe(gulp.dest( dir ));
 });

/**
 * Assets
 */
gulp.task('assets', function () {
    var aws = {
        key: secrets.aws.key,
        secret: secrets.aws.secret,
        bucket: secrets.aws.bucket,
        region: secrets.aws.region
    };

    gulp.src([ paths.build + '/**' ])
        .pipe(plugins.gzip())
        .pipe(plugins.s3(aws, {
            headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' },
            gzippedOnly: true
        }));

    gulp.src([ 'static/touch-icons/**/*' ])
        .pipe(plugins.gzip())
        .pipe(plugins.rename({ dirname: "touch-icons" }))
        .pipe(plugins.s3(aws, {
            headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' }
        }));

    gulp.src([ '_site/images/output/**/*' ])
        .pipe(plugins.gzip())
        .pipe(plugins.rename({ dirname: "images/output" }))
        .pipe(plugins.s3(aws, {
            headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' }
        }));

    gulp.src([ '_site/images/src/**/*' ])
        .pipe(plugins.gzip())
        .pipe(plugins.rename({ dirname: "images/src" }))
        .pipe(plugins.s3(aws));

});


/**
 * Jekyll
 */
gulp.task('jekyll', function() {
    var stream = require('child_process')
        .spawn('jekyll', ['build', '--drafts', '--future'], {stdio: 'inherit'});
    return stream;
});
gulp.task('jekyll:production', function() {
    var stream = require('child_process')
        .spawn('jekyll', ['build', '--config',  '_config.yml,_config-production.yml'], {stdio: 'inherit'});
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
gulp.task('deploy', function() {
    var dest = [
        secrets.servers.production.username,
        '@',
        secrets.servers.production.hostname,
        ':',
        secrets.servers.production.destination
    ].join('');
    require('child_process').spawn('rsync', ['-azP', '--delete', '_site/', dest ], {stdio: 'inherit'});

});


/**
 * Build
 */
gulp.task('build', function (done) {
    runSequence(
        'jekyll:production',
        'clean',
        'css',
        'js',
        'imagemin',
        'version',
        'assets',
    done);
});

/**
 * Default task
 */
gulp.task('default', [ 'jekyll', 'serve', 'watch']);
