var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('jekyll', function(done) {
    exec('jekyll build --drafts --future --config _config.yml,_config-dev.yml', done);
});

gulp.task('jekyll:production', function(done) {
    exec('jekyll build', done);
});
