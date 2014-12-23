var gulp = require('gulp');
var paths = require('../config').paths;

gulp.task('watch', function() {
    gulp.watch(
        paths.styleSrc + '/**/*.scss',
        ['css']
    );
    gulp.watch(
        paths.jsSrc + '/**/*.js',
        ['js']
    );
    gulp.watch([
        paths.styleSrc + '/**',
        '_layouts/**',
        '_includes/**',
        '_drafts/**',
        '_posts/**',
        '*.html'
    ], ['jekyll']);
});
