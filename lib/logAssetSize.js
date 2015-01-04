/*jshint node:true*/
'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var AWS = require('aws-sdk');
var argv = require('minimist')(process.argv.slice(2));
var shouldLogAssets = (typeof argv.metrics == 'undefined') ? true : argv.metrics;

module.exports = function(options) {

    var pluginName = 'logAssetSize';

    function toKB(size) {
        return parseFloat((size / 1024).toFixed(2), 10);
    }

    function getNamespace(fpath) {
        var namespace = false;
        if (/\.css/.test(fpath)) {
            namespace = 'Stylesheets';
        } else if (/\.js/.test(fpath)) {
            namespace = 'JavaScripts';
        }
        return namespace;
    }

    return through.obj(function(file, enc, callback) {

        var metricName, size, params;

        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new PluginError(pluginName, 'Streaming not supported'));
        }

        if (file.isBuffer() && shouldLogAssets) {

            if (typeof options.awsConfig !== 'undefined') {
                AWS.config.update(options.awsConfig);
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
                Namespace : getNamespace(file.path) || 'Assets',
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
                gutil.log(gutil.colors.green('[CloudWatch] ' + metricName + ' / ' + size + ' kb / ' + options.compressionType));
                this.push(file);
                callback();
            }.bind(this));

        } else {
            return callback(null, file);
        }

    });
};
