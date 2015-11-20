'use strict';

import gulp from 'gulp';
import psi from 'psi';
import pkg from '../package.json';

const urls = pkg.config.urls;

gulp.task('pagespeed', function () {
    psi.output(urls.prod, {strategy: 'mobile'});
});
