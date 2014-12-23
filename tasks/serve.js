var gulp = require('gulp');
var paths = require('../config').paths;
var webserver = require('gulp-webserver');

gulp.task('serve', function() {
    gulp.src('_site/')
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});
