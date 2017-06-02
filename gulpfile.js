const gulp = require('gulp'),
    connect = require('gulp-connect'),
    rollup = require('gulp-better-rollup'),
    babel = require('rollup-plugin-babel'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'),
    del = require('del'),
    pkg = require('./package.json'),
    paths = require('./config/paths'),
    babelCfg = require('./config/babel.config'),
    connectCfg = require('./config/connect.config');

gulp.task('clean', () => del(paths.dist.root));

gulp.task('serve', () => connect.server(connectCfg));

gulp.task('make', () => {
    return gulp.src(paths.src.index)
        .pipe(rollup({
            plugins: [
                babel(babelCfg)
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
        .pipe(gulp.dest(paths.dist.root))
        .pipe(connect.reload());
});

gulp.task('uglify', () => {
    return gulp.src(paths.dist.index)
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dist.root));
});

gulp.task('jshint', () => {
    return gulp.src(paths.src.index)
        .pipe(jshint({
            esversion: 6,
            node: true,
            browser: true,
            eqeqeq: true,
            latedef: true,
            undef: true,
            unused: true,
            varstmt: true,
            module: true,
            strict: true
        }))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', () => {
    gulp.watch(paths.demo, ['make']);
    gulp.watch(paths.src.js, ['jshint']);
});

gulp.task('default', cb => runSequence('clean', 'jshint', 'make', 'uglify', 'serve', 'watch', cb));
