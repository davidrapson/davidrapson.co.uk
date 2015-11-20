'use strict';

import path from 'path';
import mime from 'mime';
import extend from 'extend';
import through from 'through2';
import gutil from 'gulp-util';
import AWS from 'aws-sdk';

mime.default_type = 'text/plain'; // eslint-disable-line camelcase

module.exports = function (options, params) {
    const pluginName = 's3Publish';

    return through.obj(function (file, enc, callback) {
        const regexGzip = /\.([a-z]{2,})\.gz$/i;
        const regexGeneral = /\.([a-z]{2,})$/i;

        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new gutil.PluginError(pluginName, 'Streaming not supported'));
        }

        if (file.isBuffer()) {
            AWS.config.update({region: options.region});

            let uploadPath = file.path.replace(file.base, options.pathPrefix || '');
            uploadPath = uploadPath.replace(new RegExp('\\\\', 'g'), '/');

            /**
             * Default params
             */
            let defaults = {
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
            const s3 = new AWS.S3();
            s3.upload(extend(defaults, params), err => {
                let {red, green} = gutil.colors;
                let src = path.basename(file.path);
                let syncMsg = `${src} -> ${uploadPath}`;
                gutil.log(((err) ? red('[Publish failed]', syncMsg) : green('[Published]', syncMsg)));
                this.push(file);
                callback();
            });
        }
    });
};
