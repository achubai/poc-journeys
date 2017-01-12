var gulp = require('gulp'),
    inject = require('gulp-inject'),
    watch = require('gulp-watch'),
    eslint = require('gulp-eslint'),
    concat = require('gulp-concat');


/**
 * Build app for development
 * Watch new files
 * */
gulp.task('default', ['injectScriptsDev'], function () {
    var sources = ['./app/**/*.js'],
        templates = ['./templates/**/*.html'];

    // run first time, than do actions by watchers
    gulp.start('injectTemplates');

    watch(sources, {events: ['add', 'unlink']}, function () {
        gulp.start('injectScriptsDev');
    });

    watch(templates, {events: ['add', 'change', 'unlink']}, function () {
        gulp.start('injectTemplates');
    });
});

gulp.task('build', ['injectScriptsBuild']);

/**
 * Inject all development files
 * */
gulp.task('injectScriptsDev', function (done) {
    var target = gulp.src('./index.html');
    var sources = gulp.src(
        [
            './app/**/*.js',
            './assets/css/**/*.css'
        ],
        {read: false});

    target
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('./'));

    target.on('end', function () {
        done();
    });
});

gulp.task('lint', function () {

    return gulp.src(['app/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('buildApp', ['injectRepo'], function () {
    gulp.src('app/**/*.html')
        .pipe(gulp.dest('./dist'));

    gulp.src('app/**/*.js')
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('injectTemplates', function () {
    gulp.src('index.html')
        .pipe(inject(gulp.src(['./templates/**/*.html']), {
            starttag: '<!-- inject:templates:{{ext}} -->',
            transform: function (filePath, file) {
                return file.contents.toString('utf8');
            }
        }))
        .pipe(gulp.dest('./'));

});

gulp.task('injectRepo', function () {
    gulp.src('index.html')
        .pipe(inject(gulp.src(['./app/repositories/**/*.js']), {
            starttag: '<!-- inject:repositories:{{ext}} -->',
            transform: function (filePath, file) {
                return '<script type="text/javascript">' + file.contents.toString('utf8') + '</script>';
            }
        }))
        .pipe(gulp.dest('./'));

});

