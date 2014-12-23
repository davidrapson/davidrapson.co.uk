/*jshint node:true*/
'use strict';

var stream = require('stream');
var gutil = require('gulp-util');

module.exports = function(filename, string) {
    var src = stream.Readable({ objectMode: true });
    src._read = function () {
        this.push(new gutil.File({
            cwd : '',
            base : '',
            path : filename,
            contents : new Buffer(string)
        }));
        this.push(null);
    };
    return src;
};
