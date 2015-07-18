var gulp = require('gulp');
var paths = require('../config').paths;
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('serve', function() {

    browserSync({
        server: {
            baseDir: paths.buildDir
        }
    });

    gulp.watch([
        paths.styleDest + '/*.css',
        paths.sourceDir + '/_layouts/**',
        paths.sourceDir + '/_includes/**',
        paths.sourceDir + '/_drafts/**',
        paths.sourceDir + '/_posts/**'
    ], ['jekyll']);

    gulp.watch(paths.styleSrc + '/**/*.scss',['css']);

    gulp.watch(paths.jsSrc + '/**/*.js', ['js']);

    gulp.watch([
        paths.styleDest + '/*.css',
        paths.jsDest + '/*.js'
    ], {cwd: paths.buildDir}, reload);

});
