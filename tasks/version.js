var gulp = require('gulp');
var pkg = require('../package.json');
var paths = require('./_config.json').paths;
var stringSrc = require('./_lib/stringSrc');
var hashFiles = require('hash-files');

/**
 * Build a version manifest file to be used in Jekyll _data
 */
gulp.task('version', function () {
    return stringSrc('assets.json', JSON.stringify({
        "version": pkg.version,
        "head": {
            "hash": hashFiles.sync({ files: [ paths.styleDest + '/head.min.css' ] })
        },
        "style": {
            "hash": hashFiles.sync({ files: [ paths.styleDest + '/style.min.css' ] })
        }
    })).pipe(gulp.dest( paths.sourceDir + '/_data' ));
});
