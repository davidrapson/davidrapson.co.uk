var gulp = require('gulp');
var paths = require('./_config.json').paths;
var exec = require('child_process').exec;

/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
var runSequence = require('run-sequence');

gulp.task('deploy', function(done) {
    runSequence('build', 'publishAssets', 'rsync', done);
});

gulp.task('rsync', function(done) {
    var dest = [
        process.env.DEPLOY_USERNAME,
        '@',
        process.env.DEPLOY_HOSTNAME,
        ':',
        process.env.DEPLOY_DESTINATION
    ].join('');
    exec('rsync -azP --delete ' + paths.buildDir + '/ ' + dest, function(error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        done();
    });
});
