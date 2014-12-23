var gulp = require('gulp');
var paths = require('../config').paths;
var del = require('del');

/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
var runSequence = require('run-sequence');

gulp.task('clean', function() {
    del([ paths.build + '/**' ]);
});

gulp.task('build', function (done) {
    return runSequence(
        'clean',
        'css',
        'js',
        'jekyll:production',
        'version',
        'publishAssets',
    done);
});

gulp.task('build:simple', function (done) {
    return runSequence(
        'clean',
        'css',
        'js',
        'jekyll:production',
        'version',
    done);
});
