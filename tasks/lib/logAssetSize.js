'use strict';

import path from 'path';
import through from 'through2';
import minimist from 'minimist';
import gutil from 'gulp-util';
import AWS from 'aws-sdk';

const argv = minimist(process.argv.slice(2));
const shouldLogAssets = (typeof argv.metrics === 'undefined') ? true : argv.metrics;

const toKB = size => parseFloat((size / 1024).toFixed(2));

const getNamespace = fpath => {
    let namespace = false;
    if (/\.css/.test(fpath)) {
        namespace = 'Stylesheets';
    } else if (/\.js/.test(fpath)) {
        namespace = 'JavaScripts';
    }
    return namespace;
};

module.exports = function (options) {
    const pluginName = 'logAssetSize';

    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new gutil.PluginError(pluginName, 'Streaming not supported'));
        }

        if (file.isBuffer() && shouldLogAssets) {
            AWS.config.update({region: options.region});
            let cloudwatch = new AWS.CloudWatch();
            let metricName = path.basename(file.path);
            let size = toKB(file.contents.length);
            let params = {
                Namespace: getNamespace(file.path) || 'Assets',
                MetricData: [{
                    MetricName: metricName,
                    Value: size,
                    Unit: 'Kilobytes',
                    Dimensions: [{
                        Name: 'Compression',
                        Value: options.compressionType || 'None'
                    }]
                }]
            };
            cloudwatch.putMetricData(params, err => {
                if (err) {
                    callback(new Error('Error putting CloudWatch metrics data'));
                }
                let msg = `[CloudWatch] ${metricName}  / ${size} kb / ${options.compressionType}`;
                gutil.log(gutil.colors.green(msg));
                this.push(file);
                callback();
            });
        } else {
            return callback(null, file);
        }
    });
};
