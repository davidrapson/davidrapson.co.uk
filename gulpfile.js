'use strict';

var gulp = require('gulp');
var del = require('del');
var requireDir = require('require-dir');
var pkg = require('./package.json');

gulp.task('clean', function (done) {
    const {sourceDir, publicSource} = pkg.config.buildPaths;
    del.sync([publicSource + '/**']);
    del.sync(['javascripts.json', 'stylesheets.json'].map(x => `${sourceDir}/_data/${x}`));
    done();
});

requireDir('./tasks');

/**
 * Default task
 */
gulp.task('default', [
    'build:simple',
    'serve'
]);
