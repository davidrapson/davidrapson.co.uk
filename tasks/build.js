'use strict';

import gulp from 'gulp';
import del from 'del';
/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
import runSequence from 'run-sequence';
import pkg from '../package.json';

const paths = pkg.config.buildPaths;

gulp.task('clean', done => {
    del.sync([`${paths.publicSource}/**`]);
    del.sync([
        `${paths.sourceDir}/_data/javascripts.json`,
        `${paths.sourceDir}/_data/stylesheets.json`
    ]);
    done();
});

gulp.task('build', done => {
    runSequence('clean', 'css', 'js', 'jekyll:production', done);
});

gulp.task('build:simple', done => {
    runSequence('css', 'js', 'jekyll', done);
});
