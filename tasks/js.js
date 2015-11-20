'use strict';

import gulp from 'gulp';
import gulpPlugins from 'gulp-load-plugins';
import pkg from '../package.json';

const plugins = gulpPlugins();
const paths = pkg.config.buildPaths;

gulp.task('js', ['lint'], function () {
    return gulp.src([
        `${paths.jsSrc}/bower_components/picturefill/dist/picturefill.min.js`
    ])
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('combined.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths.jsDest))
        .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.buildDistJs))
        .pipe(plugins.rev.manifest('javascripts.json'))
        .pipe(gulp.dest(paths.sourceDirData));
});

gulp.task('lint', function () {
    return gulp.src([
        'gulpfile.babel.js',
        'tasks/**/*.js'
    ]).pipe(plugins.xo({quiet: true}));
});
