var gulp = require('gulp');
var paths = require('../config').paths;
var gzip = require('gulp-gzip');
var imagemin = require('gulp-imagemin');
var s3Publish = require('../lib/s3Publish');
var awsConfig = require('../secrets.json').aws;
var logAssetSize = require('../lib/logAssetSize');

gulp.task('publishAssets', ['publishImages'], function () {
    return gulp.src([ paths.publicDist + '/**' ])
        .pipe(logAssetSize({
            'config': awsConfig,
            'compressionType': 'None'
        }))
        .pipe(gzip())
        .pipe(logAssetSize({
            'config': awsConfig,
            'compressionType': 'GZip'
        }))
        .pipe(s3Publish({
            bucket: awsConfig.bucket,
            awsConfig: awsConfig
        }, {
            'CacheControl': 'max-age=315360000, no-transform, public'
        }));
});

gulp.task('publishImages', function () {
    var dir = paths.publicImages;
    return gulp.src( dir + '/**' )
        .pipe(imagemin({ progressive: true }))
        .pipe(s3Publish({
            bucket: awsConfig.bucket,
            pathPrefix: 'images/',
            awsConfig: awsConfig
        }, {
            'CacheControl': 'max-age=315360000, no-transform, public'
        }));
});
