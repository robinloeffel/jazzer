const gulp = require('gulp');
const connect = require('gulp-connect');
const betterRollup = require('gulp-better-rollup');
const rollupBabel = require('rollup-plugin-babel');
const runSequence = require('run-sequence');
const del = require('del');
const pkg = require('./package.json');

gulp.task('clean', () => del('dist'));

gulp.task('make', () => {
    return gulp.src('src/jazzer.js')
        .pipe(betterRollup({
            plugins: [
                rollupBabel({
                    presets: [
                        ['@babel/preset-env', {
                            targets: {
                                ie: 11,
                                browsers: 'last 2 versions'
                            },
                            useBuiltIns: 'usage',
                            modules: false,
                            debug: true
                        }]
                    ],
                    ignore: ['node_modules']
                })
            ]
        }, [{
            file: pkg.module,
            format: 'es'
        }, {
            file: pkg.browser,
            format: 'iife'
        }, {
            file: pkg.main,
            format: 'cjs'
        }]))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', callback => {
    runSequence('clean', 'make', callback);
});
