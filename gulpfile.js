let gulp = require('gulp'),
    connect = require('gulp-connect'),
    rollup = require('gulp-better-rollup'),
    babel = require('rollup-plugin-babel'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'),
    del = require('del'),
    pkg = require('./package.json');

gulp.task('clean', () => {
    return del('dist');
});

gulp.task('serve', () => {
    return connect.server({
        root: '.',
        port: 8080,
        livereload: true
    });
});

gulp.task('make', () => {
    return gulp.src('src/jazzer.js')
        .pipe(rollup({
            plugins: [
                babel({
                    presets: ['es2015-rollup']
                })
            ]
        }, [{
            dest: pkg.main,
            format: 'umd'
        }, {
            dest: pkg.module,
            format: 'es'
        }, {
            dest: pkg.browser,
            format: 'iife'
        }]))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
});

gulp.task('uglify', () => {
    return gulp.src('dist/jazzer.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('jshint', () => {
    return gulp.src('src/jazzer.js')
        .pipe(jshint({
            esversion: 6,
            node: true
        }))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', () => {
    gulp.watch(['./*.html', './*.css', 'src/*.js'], ['make']);
    gulp.watch('src/*.js', ['jshint']);
});

gulp.task('default', (callback) => {
    return runSequence('clean', 'jshint', 'make', 'uglify', 'serve', 'watch');
});
