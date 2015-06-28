var gulp = require('gulp');
var pagespeed = require('psi');

gulp.task('pagespeed', function () {
    pagespeed.output('http://davidrapson.co.uk/', {
        strategy: 'mobile'
    });
});
