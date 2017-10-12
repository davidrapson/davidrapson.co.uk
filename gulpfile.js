'use strict';

var exec = require('child_process').exec;
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var del = require('del');
var browserSync = require('browser-sync');
var pkg = require('./package.json');

gulp.task('clean', function (done) {
    var {sourceDir, publicSource} = pkg.config.buildPaths;
    del.sync([publicSource + '/**']);
    del.sync(['javascripts.json', 'stylesheets.json'].map(x => `${sourceDir}/_data/${x}`));
    done();
});

gulp.task('js', function () {
    var paths = pkg.config.buildPaths;
    return gulp.src([
        './node_modules/picturefill/dist/picturefill.min.js',
        './node_modules/fitvids/dist/fitvids.min.js',
        paths.jsSrc + '/app.js'
    ])
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
    return gulp.src([`${paths.styleSrc}/style.scss`])
        .pipe(plugins.plumber())
        .pipe(plugins.sass())
        .pipe(plugins.autoprefixer('last 2 versions'))
        .pipe(plugins.csso())
        .pipe(gulp.dest(`${paths.sourceDir}/_includes`));
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

    gulp.watch([
        `*.yml`,
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

/**
 * Default task
 */
gulp.task('default', [
    'build:simple',
    'serve'
]);
