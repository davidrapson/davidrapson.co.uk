var gulp = require('gulp');
var paths = require('./_config.json').paths;
var del = require('del');

/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
var runSequence = require('run-sequence');

gulp.task('clean', function(done) {
    del([ paths.build + '/**' ], done);
});

gulp.task('build', ['clean'], function (done) {
    runSequence(
        ['css', 'js'],
        'jekyll:production',
        'version',
    done);
});

gulp.task('build:simple', ['clean'], function (done) {
    runSequence(
        ['css', 'js'],
        'jekyll',
    done);
});
