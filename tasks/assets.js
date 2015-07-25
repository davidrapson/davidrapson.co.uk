var gulp = require('gulp');
var paths = require('./_config.json').paths;
var gzip = require('gulp-gzip');
var imagemin = require('gulp-imagemin');
var s3Publish = require('./_lib/s3Publish');
var awsConfig = require('../secrets.json').aws;
var logAssetSize = require('./_lib/logAssetSize');
var cacheControl = 'max-age=315360000, no-transform, public';

gulp.task('publishAssets', ['publishImages'], function () {

    return gulp.src(paths.publicDist + '/**')
        // Log pre-gzipped size to CloudWatch
        .pipe(logAssetSize({
            awsConfig: awsConfig,
            compressionType: 'None'
        }))
        // Gzip assets
        .pipe(gzip())
        // Log post-gzipped size to CloudWatch
        .pipe(logAssetSize({
            awsConfig: awsConfig,
            compressionType: 'GZip'
        }))
        .pipe(s3Publish({
            awsConfig: awsConfig,
            bucket: awsConfig.bucket,
            pathPrefix: 'assets/'
        }, {
            'CacheControl': cacheControl
        }));
});

gulp.task('publishImages', function () {
    var dir = paths.publicImages;
    return gulp.src(dir + '/**')
        // Minify images before publishing
        .pipe(imagemin({ progressive: true }))
        // Publish images to S3
        .pipe(s3Publish({
            awsConfig: awsConfig,
            bucket: awsConfig.bucket,
            pathPrefix: 'images/'
        }, {
            'CacheControl': cacheControl
        }));
});
