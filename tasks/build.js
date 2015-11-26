'use strict';

import gulp from 'gulp';
import del from 'del';
/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
import runSequence from 'run-sequence';
import pkg from '../package.json';

const {sourceDir, publicSource} = pkg.config.buildPaths;

gulp.task('clean', done => {
    del.sync([`${publicSource}/**`]);
    del.sync(['javascripts.json', 'stylesheets.json'].map(x => `${sourceDir}/_data/${x}`));
    done();
});

gulp.task('build', done => {
    runSequence('clean', 'css', 'js', 'jekyll:production', done);
});

gulp.task('build:simple', done => {
    runSequence('css', 'js', 'jekyll', done);
});
