'use strict';

import gulp from 'gulp';
import gulpPlugins from 'gulp-load-plugins';
import s3Publish from './lib/s3Publish';
import logAssetSize from './lib/logAssetSize';
import pkg from '../package.json';

const plugins = gulpPlugins();
const paths = pkg.config.buildPaths;
const awsConfig = pkg.config.aws;
const cacheControl = 'max-age=315360000, no-transform, public';

gulp.task('publishAssets', ['publishImages'], function () {
    return gulp.src(`${paths.publicDist}/**`)
        .pipe(logAssetSize({
            region: awsConfig.region,
            compressionType: 'None'
        }))
        .pipe(plugins.gzip())
        .pipe(logAssetSize({
            region: awsConfig.region,
            compressionType: 'GZip'
        }))
        .pipe(s3Publish({
            bucket: awsConfig.bucket,
            region: awsConfig.region,
            pathPrefix: 'assets/'
        }, {CacheControl: cacheControl}));
});

gulp.task('publishImages', function () {
    return gulp.src(`${paths.publicImages}/**`)
        .pipe(plugins.imagemin({progressive: true}))
        .pipe(s3Publish({
            bucket: awsConfig.bucket,
            region: awsConfig.region,
            pathPrefix: 'images/'
        }, {CacheControl: cacheControl}));
});
