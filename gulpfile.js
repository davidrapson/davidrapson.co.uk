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
    'static': 'assets',
    'styleSrc': 'assets/stylesheets',
    'styleDest': 'public/stylesheets',
    'jsSrc': 'assets/javascripts',
    'jsDest': 'public/javascripts',
    'build': 'public',
    'buildVersion': 'public/dist/' + pkg.version,
    'publicImages': '_site/public/images',
    'publicDist': '_site/public/dist'
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
        paths.styleSrc + '/head.less',
        paths.styleSrc + '/style.less',
        paths.styleSrc + '/print.less'
    ])
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer('last 2 version', 'ie 8', 'ie 9'))
        .pipe(gulp.dest( paths.styleDest ))
        .pipe(plugins.cssmin())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest( paths.styleDest ))
        .pipe(gulp.dest( paths.buildVersion + '/stylesheets' ))
    return stream;
});


/**
 * JavaScript
 */
gulp.task('js', ['lint'], function () {
    var stream = gulp.src([
        paths.jsSrc + '/components/picturefill/dist/picturefill.min.js',
        paths.jsSrc + '/app.js'
    ])
        .pipe(plugins.plumber())
        .pipe(plugins.concat('app.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest( paths.jsDest ))
        .pipe(gulp.dest( paths.buildVersion + '/javascripts' ));
    return stream;
});

gulp.task('lint', function() {
    var stream = gulp.src([
        paths.jsSrc + '/app.js'
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
            "hash": hashFiles.sync({ files: [ paths.styleDest + '/head.min.css' ] })
        },
        "style": {
            "hash": hashFiles.sync({ files: [ paths.styleDest + '/style.min.css' ] })
        }
    })).pipe(gulp.dest( '_data' ));
    return stream;
});

/**
 * Copy head.css
 */
gulp.task('css:head', function () {
    var stream = gulp.src([
        paths.styleDest + '/head.min.css',
    ]).pipe(gulp.dest( '_includes' ));
    return stream;
});


/**
 * Minify Images
 */
 gulp.task('imagemin', function () {
    var dir = paths.publicImages;
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

    gulp.src([ paths.publicDist + '/**' ])
        .pipe(plugins.gzip())
        .pipe(plugins.s3(aws, {
            headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' },
            gzippedOnly: true
        }));

    gulp.src([ paths.publicImages + '**/*' ])
        .pipe(plugins.rename({ dirname: "images" }))
        .pipe(plugins.s3(aws, {
            headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' }
        }));

});


/**
 * Jekyll
 */
gulp.task('jekyll', function() {
    var stream = require('child_process')
        .spawn('jekyll', ['build', '--drafts', '--future', '--config',  '_config.yml,_config-dev.yml'], {stdio: 'inherit'});
    return stream;
});

gulp.task('jekyll:production', function() {
    var stream = require('child_process')
        .spawn('jekyll', ['build'], {stdio: 'inherit'});
    return stream;
});


/**
 * Watch
 */
gulp.task('watch', function() {
    gulp.watch( paths.styleSrc + '/**/*.less', ['css']);
    gulp.watch( paths.jsSrc + '/**/*.js', ['js']);
    gulp.watch([
        paths.styleSrc + '/**',
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
        'clean',
        'css',
        'js',
        'jekyll:production',
        'imagemin',
        'version',
        'assets',
    done);
});

/**
 * Default task
 */
gulp.task('default', [ 'jekyll', 'serve', 'watch']);
