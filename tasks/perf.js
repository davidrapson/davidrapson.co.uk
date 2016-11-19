'use strict';

var gulp = require('gulp');
var psi = require('psi');
var pkg = require('../package.json');

const urls = pkg.config.urls;

gulp.task('pagespeed', function () {
    psi.output(urls.prod, {strategy: 'mobile'});
});
