var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('jekyll', function(done) {
    exec('bundle exec jekyll clean');
    exec('bundle exec jekyll build --drafts --future --config _config.yml,_config-dev.yml', done);
});

gulp.task('jekyll:production', function(done) {
    exec('bundle exec jekyll clean');
    exec('bundle exec jekyll build', done);
});
