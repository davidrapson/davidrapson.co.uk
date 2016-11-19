'use strict';

var path = require('path');
var exec = require('child_process').exec;
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var del = require('del');
var opn = require('opn');
var browserSync = require('browser-sync');
var pkg = require('./package.json');

gulp.task('clean', function (done) {
    var {sourceDir, publicSource} = pkg.config.buildPaths;
    del.sync([publicSource + '/**']);
    del.sync(['javascripts.json', 'stylesheets.json'].map(x => `${sourceDir}/_data/${x}`));
    done();
});

gulp.task('lint', function () {
    return gulp.src(['gulpfile.js', 'tasks/**/*.js'])
        .pipe(plugins.xo({quiet: true}));
});

gulp.task('js', ['lint'], function () {
    var paths = pkg.config.buildPaths;
    return gulp.src(['./node_modules/picturefill/dist/picturefill.min.js'])
        .pipe(plugins.plumber())
        .pipe(plugins.concat('combined.js'))
        .pipe(gulp.dest(paths.jsDest))
        .pipe(plugins.rev())
        .pipe(gulp.dest(paths.buildDistJs))
        .pipe(plugins.rev.manifest('javascripts.json'))
        .pipe(gulp.dest(paths.sourceDirData));
});

gulp.task('css', function () {
    const paths = pkg.config.buildPaths;
    return gulp.src([`${paths.styleSrc}/{head,style}.scss`])
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass())
        .pipe(plugins.autoprefixer('last 2 version', 'ie 8', 'ie 9'))
        .pipe(plugins.csso())
        .pipe(gulp.dest(paths.styleDest))
        .pipe(plugins.if(
            // Pipe head.min.css to _includes for inlining
            file => path.basename(file.path) === 'head.css',
            gulp.dest(`${paths.sourceDir}/_includes`)
        ))
        .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.buildDistCss))
        .pipe(plugins.rev.manifest('stylesheets.json'))
        .pipe(gulp.dest(paths.sourceDirData));
});

gulp.task('images', function () {
    var {publicImages} = pkg.config.buildPaths;
    return gulp.src(`${publicImages}/**`)
        .pipe(plugins.imagemin({progressive: true}))
        .pipe(gulp.dest(publicImages));
});

gulp.task('jekyll', function (done) {
    exec('bundle exec jekyll clean');
    exec('bundle exec jekyll build --drafts --future --config _config.yml,_config-dev.yml', done);
});

gulp.task('jekyll:production', function (done) {
    exec('bundle exec jekyll clean');
    exec('bundle exec jekyll build', done);
});

gulp.task('serve', function () {
    const paths = pkg.config.buildPaths;

    browserSync({
        open: false,
        server: {baseDir: paths.buildDir}
    });

    opn('https://davidrapson.site/');

    gulp.watch([
        `${paths.styleDest}/*.css`,
        `${paths.sourceDir}/*.{html,md}`,
        `${paths.sourceDir}/{_layouts,_includes,_drafts,_posts}/**`
    ], ['build:simple']);
    gulp.watch(`${paths.styleSrc}/**/*.scss`, ['css']);
    gulp.watch(`${paths.jsSrc}/**/*.js`, ['js']);

    gulp.watch([
        `${paths.styleDest}/*.css`,
        `${paths.jsDest}/*.js`
    ], {cwd: paths.buildDir}, browserSync.reload);
});

gulp.task('build', function (done) {
    runSequence(
        'clean',
        'css',
        'js',
        'jekyll:production',
        'images',
    done);
});

gulp.task('build:simple', function (done) {
    runSequence('css', 'js', 'jekyll', 'images', done);
});

// requireDir('./tasks');

/**
 * Default task
 */
gulp.task('default', [
    'build:simple',
    'serve'
]);
