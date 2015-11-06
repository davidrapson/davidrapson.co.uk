var gulp = require('gulp');
var paths = require('./_config.json').paths;
var del = require('del');

/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
var runSequence = require('run-sequence');

gulp.task('clean', function(done) {
    del.sync([ paths.publicSource + '/**' ]);
    del.sync([
        paths.sourceDir + '/_data/javascripts.json',
        paths.sourceDir + '/_data/stylesheets.json'
    ]);
    done();
});

gulp.task('build', function (done) {
    runSequence(
        'clean',
        'css',
        'js',
        'jekyll:production',
    done);
});

gulp.task('build:simple', function (done) {
    runSequence('css', 'js', 'jekyll', done);
});
