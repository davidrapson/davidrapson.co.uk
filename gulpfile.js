/*jshint node:true*/
/**
 * gulpfile.js
 */


/**
 * Config
 */
var pkg = require('./package.json');
var secrets = require('./secrets.json');
var awsConfig = {
    bucket: secrets.aws.bucket,
    region: secrets.aws.region,
    key: secrets.aws.accessKeyId,
    secret: secrets.aws.secretAccessKey
};


/**
 * Require core modules
 */
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    hashFiles = require('hash-files'),
    del = require('del');


/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
var runSequence = require('run-sequence');


/**
 * Require custom tasks
 */
var stringSrc = require('./lib/stringSrc');
var logAssetSize = require('./lib/logAssetSize');


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
    'publicImages': '_site/images',
    'publicDist': '_site/public/dist'
};


/**
 * Build CSS
 */
gulp.task('css', function () {
    return gulp.src([
        paths.styleSrc + '/head.scss',
        paths.styleSrc + '/style.scss'
    ])
        .pipe(plugins.plumber())
        // Lint CSS
        .pipe(plugins.scssLint({
            'config': '.scss-lint.yml',
            'bundleExec': true
        }))
        // Build CSS
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        .pipe(plugins.autoprefixer('last 2 version', 'ie 8', 'ie 9'))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest( paths.styleDest ))
        // Minify CSS
        .pipe(plugins.cssmin())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest( paths.styleDest ))
        // Versioned build
        .pipe(gulp.dest( paths.buildVersion + '/stylesheets' ));
});


/**
 * Copy head.css to _includes
 */
gulp.task('css:head', ['css'], function () {
    return gulp.src([
        paths.styleDest + '/head.min.css',
    ]).pipe(gulp.dest( '_includes' ));
});


/**
 * Build JavaScript
 */
gulp.task('js', ['lint'], function () {
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


/**
 * JSHint
 */
gulp.task('lint', function() {
    return gulp.src([
        'lib/*.js',
        './gulpfile.js',
        paths.jsSrc + '/app.js'
    ])
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});


/**
 * Version manifest
 * Build a version manifest file to be used in Jekyll _data
 */
gulp.task('version', function () {
    return stringSrc('assets.json', JSON.stringify({
        "version": pkg.version,
        "head": {
            "hash": hashFiles.sync({ files: [ paths.styleDest + '/head.min.css' ] })
        },
        "style": {
            "hash": hashFiles.sync({ files: [ paths.styleDest + '/style.min.css' ] })
        }
    })).pipe(gulp.dest( '_data' ));
});


/**
 * Publish and optimise images
 */
 gulp.task('images', function () {
    var dir = paths.publicImages;
    return gulp.src( dir + '/**' )
        .pipe(plugins.imagemin({
            progressive: true
        }))
        .pipe(gulp.dest( dir ))
        .pipe(plugins.rename(function(path){
            path.dirname = "images/" + path.dirname;
            return path;
        }))
        .pipe(plugins.s3(awsConfig, {
            headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' }
        }));
 });


/**
 * Publish assets
 */
gulp.task('publishAssets', function () {
    return gulp.src([ paths.publicDist + '/**' ])
        .pipe(logAssetSize({
            'config': secrets.aws,
            'compressionType': 'None'
        }))
        .pipe(plugins.gzip())
        .pipe(logAssetSize({
            'config': secrets.aws,
            'compressionType': 'GZip'
        }))
        .pipe(plugins.s3(awsConfig, {
            headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' },
            gzippedOnly: true
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


/**
 * Jekyll: Production
 */
gulp.task('jekyll:production', function() {
    var stream = require('child_process')
        .spawn('jekyll', ['build'], {stdio: 'inherit'});
    return stream;
});


/**
 * Watch
 */
gulp.task('watch', function() {
    gulp.watch( paths.styleSrc + '/**/*.scss', ['css']);
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
 * Clean build directory
 */
gulp.task('clean', function() {
    del([ paths.build + '/**' ]);
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
        'images',
        'version',
        'publishAssets',
    done);
});


/**
 * Build: Simple
 * Build without publish
 */
gulp.task('build:simple', function (done) {
    runSequence(
        'clean',
        'css',
        'js',
        'jekyll:production',
        'images',
        'version',
    done);
});


/**
 * Default task
 */
gulp.task('default', [ 'jekyll', 'serve', 'watch']);
