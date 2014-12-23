/*jshint node:true*/

var gulp = require('gulp');

/**
 * Load tasks
 */
require('require-dir')('./tasks', { recurse: true });

/**
 * Default task
 */
gulp.task('default', [ 'jekyll', 'serve', 'watch']);
