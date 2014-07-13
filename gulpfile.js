var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('scripts', function() {
    gulp.src('js/app.js')
        .pipe(browserify())
        .pipe(gulp.dest('js/build/'));
});

gulp.task('default', function() {
    gulp.watch('js/app.js', ['scripts']);
})

