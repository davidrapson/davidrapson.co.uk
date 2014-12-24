var gulp = require('gulp');
var paths = require('../config').paths;
var serverConfig = require('../secrets.json').servers.production;

/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
var runSequence = require('run-sequence');

gulp.task('deploy', function(done) {
    runSequence(
        'publishAssets',
        'rsync',
    done);
});

gulp.task('rsync', function() {
    var dest = [
        serverConfig.username,
        '@',
        serverConfig.hostname,
        ':',
        serverConfig.destination
    ].join('');
    require('child_process').spawn('rsync', ['-azP', '--delete', '_site/', dest ], {stdio: 'inherit'});
})
