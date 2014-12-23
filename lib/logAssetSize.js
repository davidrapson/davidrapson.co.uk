/*jshint node:true*/
'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var AWS = require('aws-sdk');

module.exports = function(options) {

    var pluginName = 'logAssetSize';

    function toKB(size) {
        return Math.round((size / 1024)).toFixed(0);
    }

    return through.obj(function(file, enc, callback) {

        var metricName, size, params;

        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new PluginError(pluginName, 'Streaming not supported'));
        }

        if (file.isBuffer()) {

            if(typeof options.config !== 'undefined') {
                AWS.config.update(options.config);
            } else {
                return callback(new PluginError(pluginName, [
                    'No credentials provided. ',
                    'Please set your credentials in `~/.aws/credentials` ',
                    'or provide a `secrets` config.'
                ].join('')));
            }

            metricName = path.basename(file.path);
            size = toKB(file.contents.length);

            params = {
                Namespace : 'Assets',
                MetricData: [{
                    MetricName: metricName,
                    Value : size,
                    Unit : 'Kilobytes',
                    Dimensions : [{
                        'Name' : 'Compression',
                        'Value' : options.compressionType || 'None'
                    }]
                }]
            };

            (new AWS.CloudWatch()).putMetricData(params, function(err, data) {
                var rid = data.ResponseMetadata.RequestId;
                gutil.log('CloudWatch | ' + rid + ' | ' + metricName);
                this.push(file);
                callback();
            }.bind(this));

        }
    });
};
