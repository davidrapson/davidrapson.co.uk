var gulp = require('gulp');
var paths = require('../config').paths;
var serverConfig = require('../secrets.json').servers.production;
var requireDir = require('require-dir');

gulp.task('deploy', function() {
    var dest = [
        serverConfig.username,
        '@',
        serverConfig.hostname,
        ':',
        serverConfig.destination
    ].join('');
    require('child_process').spawn('rsync', ['-azP', '--delete', '_site/', dest ], {stdio: 'inherit'});
});
