var gulp = require('gulp');

gulp.task('jekyll', function() {
    var stream = require('child_process')
        .spawn('jekyll', ['build', '--drafts', '--future', '--config',  '_config.yml,_config-dev.yml'], {stdio: 'inherit'});
    return stream;
});

gulp.task('jekyll:production', function() {
    var stream = require('child_process')
        .spawn('jekyll', ['build'], {stdio: 'inherit'});
    return stream;
});
