var gulp = require('gulp');
var paths = require('../config').paths;
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('serve', function() {

    var baseDir = '_site';

    browserSync({
        server: {
            baseDir: baseDir
        }
    });

    gulp.watch([
        paths.styleDest + '/*.css',
        '_layouts/**',
        '_includes/**',
        '_drafts/**',
        '_posts/**'
    ], ['jekyll']);

    gulp.watch(paths.styleSrc + '/**/*.scss',['css']);

    gulp.watch(paths.jsSrc + '/**/*.js', ['js']);

    gulp.watch([
        paths.styleDest + '/*.css',
        paths.jsDest + '/*.js'
    ], {cwd: baseDir}, reload);

});
