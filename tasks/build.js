'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

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
