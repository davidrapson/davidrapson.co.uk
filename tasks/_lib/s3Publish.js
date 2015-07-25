/*jshint node:true*/
'use strict';

var through = require('through2');
var path = require('path');
var extend = require('extend');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var AWS = require('aws-sdk');
var mime = require('mime');
mime.default_type = 'text/plain';

module.exports = function(options, params) {

    var pluginName = 's3Publish';

    return through.obj(function(file, enc, callback) {

        var defaults, uploadPath;
        var regexGzip = /\.([a-z]{2,})\.gz$/i;
        var regexGeneral = /\.([a-z]{2,})$/i;

        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new PluginError(pluginName, 'Streaming not supported'));
        }

        if (file.isBuffer()) {

            if (typeof process.env.AWS_ACCESS_KEY_ID === 'undefined') {
                return callback(new PluginError(pluginName, [
                    'No credentials provided. ',
                    'Please set your credentialls ',
                    'http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html'
                ].join('')));
            }

            AWS.config.update(options.region);

            uploadPath = file.path.replace(file.base, options.pathPrefix || '');
            uploadPath = uploadPath.replace(new RegExp('\\\\', 'g'), '/');

            /**
             * Default params
             */
            defaults = {
                Body: file.contents,
                Bucket: options.bucket,
                ACL: 'public-read',
                Key: uploadPath
            };

            /**
             * Set proper encoding for gzipped files, remove .gz suffix
             */
            if (regexGzip.test(file.path)) {
                defaults.ContentEncoding = 'gzip';
                uploadPath = uploadPath.substring(0, uploadPath.length - 3);
                defaults.Key = uploadPath;
            }

            /**
             * Set content type based on file extension
             */
            if (!defaults.ContentType && regexGeneral.test(uploadPath)) {
                defaults.ContentType = mime.lookup(uploadPath);
            }

            /**
             * Upload file
             */
            (new AWS.S3()).upload(extend(defaults, params), function(err, data) {
                var src = path.basename(file.path);
                if (err) {
                    gutil.log(gutil.colors.red('[Publish failed]', src + " -> " + uploadPath));
                } else {
                    gutil.log(gutil.colors.green('[Published]', src + " -> " + uploadPath));
                }
                this.push(file);
                callback();
            }.bind(this));

        }
    });
};
