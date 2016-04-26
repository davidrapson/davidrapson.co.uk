'use strict';

import gulp from 'gulp';
import gulpPlugins from 'gulp-load-plugins';
import pkg from '../package.json';
import logAssetSize from './lib/logAssetSize';

const plugins = gulpPlugins();
const paths = pkg.config.buildPaths;
const awsRegion = pkg.config.aws.region;

const assetConfig = type => ({region: awsRegion, compressionType: type});

gulp.task('assets', ['images'], function () {
    return gulp.src(`${paths.publicDist}/**`)
        .pipe(logAssetSize(assetConfig('None')))
        .pipe(plugins.gzip())
        .pipe(logAssetSize(assetConfig('Gzip')));
});

gulp.task('images', function () {
    return gulp.src(`${paths.publicImages}/**`)
        .pipe(plugins.imagemin({progressive: true}))
        .pipe(gulp.dest(paths.publicImages));
});
