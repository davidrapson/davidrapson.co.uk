'use strict';

import gulp from 'gulp';
/**
 * Temporary solution until gulp 4
 * https://github.com/gulpjs/gulp/issues/355
 */
import runSequence from 'run-sequence';
import childProcess from 'child_process';
import pkg from '../package.json';

const paths = pkg.config.buildPaths;

gulp.task('deploy', function (done) {
    runSequence('build', 'publishAssets', 'rsync', done);
});

gulp.task('rsync', function (done) {
    const {DEPLOY_USERNAME, DEPLOY_HOSTNAME, DEPLOY_DESTINATION} = process.env;
    const dest = `${DEPLOY_USERNAME}@${DEPLOY_HOSTNAME}:${DEPLOY_DESTINATION}`;

    const cmd = `rsync -azP --delete ${paths.buildDir}/ ${dest}`;
    childProcess.exec(cmd, function (err, stdout, stderr) {
        if (err) {
            console.log(err);
        }
        console.log(stdout);
        console.log(stderr);
        done();
    });
});
