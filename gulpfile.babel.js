'use strict';

import gulp from 'gulp';
import requireDir from 'require-dir';

requireDir('./tasks', {
    recurse: true
});

gulp.task('default', [
    'build:simple',
    'serve'
]);
