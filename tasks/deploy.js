var gulp = require('gulp');
var paths = require('./_config.json').paths;
var serverConfig = require('../secrets.json').deploy;
var exec = require('child_process').exec;

/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
var runSequence = require('run-sequence');

gulp.task('deploy', function(done) {
    runSequence(
        'build',
        'publishAssets',
        'rsync',
    done);
});

gulp.task('rsync', function(done) {
    var dest = [
        serverConfig.username,
        '@',
        serverConfig.hostname,
        ':',
        serverConfig.destination
    ].join('');
    exec('rsync -azP --delete _site/ ' + dest, function(error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        done();
    });
});
