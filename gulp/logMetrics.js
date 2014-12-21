'use strict';

var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var AWS = require('aws-sdk');

module.exports = function(options) {

    var pluginName = 'logMetrics';

    function toKB(size) {
        return Math.round((size / 1024)).toFixed(0);
    }

    return through.obj(function(file, enc, cb) {

        var self = this,
            cloudwatch, metricName, size, params;

        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new PluginError(pluginName, 'Streaming not supported'));
        }

        if (file.isBuffer()) {

            if( typeof options.secrets !== 'undefined') {
                AWS.config.update({
                    region: options.secrets.aws.region,
                    accessKeyId: options.secrets.aws.key,
                    secretAccessKey: options.secrets.aws.secret
                });
            } else {
                return cb(new PluginError(pluginName, [
                    'No credentials provided. ',
                    'Please set your credentials in `~/.aws/credentials` ',
                    'or provide a `secrets` config.'
                ].join('')));
            }

            cloudwatch = new AWS.CloudWatch();

            metricName = path.basename(file.path);
            size = toKB( file.contents.length );

            params = {
                Namespace : 'Assets',
                MetricData: [
                    {
                        MetricName: metricName,
                        Value : size,
                        Unit : 'Kilobytes',
                        Dimensions : options.dimensions
                    }
                ]
            };

            cloudwatch.putMetricData(params, function(err, data){
                gutil.log([
                    'CloudWatch | ',
                    data.ResponseMetadata.RequestId,
                    ' | ',
                    metricName
                ].join(''));
                self.push(file);
                cb();
            });

        }
    });
};
