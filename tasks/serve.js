'use strict';

import gulp from 'gulp';
import opn from 'opn';
import browserSync from 'browser-sync';
import pkg from '../package.json';

const paths = pkg.config.buildPaths;
const urls = pkg.config.urls;

gulp.task('serve', function () {
    browserSync({
        open: false,
        server: {baseDir: paths.buildDir}
    });

    opn(urls.dev);

    gulp.watch([
        `${paths.styleDest}/*.css`,
        `${paths.sourceDir}/*.html`,
        `${paths.sourceDir}/*.md`,
        `${paths.sourceDir}/_layouts/**`,
        `${paths.sourceDir}/_includes/**`,
        `${paths.sourceDir}/_drafts/**`,
        `${paths.sourceDir}/_posts/**`
    ], ['build:simple']);

    gulp.watch(`${paths.styleSrc}/**/*.scss`, ['css']);

    gulp.watch(`${paths.jsSrc}/**/*.js`, ['js']);

    gulp.watch([
        `${paths.styleDest}/*.css`,
        `${paths.jsDest}/*.js`
    ], {cwd: paths.buildDir}, browserSync.reload);
});
