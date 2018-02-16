const gulp = require('gulp');
const rollupBabel = require('rollup-plugin-babel');
const rollupUglify = require('rollup-plugin-uglify');
const rollupNodeResolve = require('rollup-plugin-node-resolve');
const del = require('del');
const rollupStream = require('rollup-stream');
const rollup = require('rollup');
const source = require('vinyl-source-stream');
const pkg = require('./package.json');

const config = {
    paths: {
        index: 'src/jazzer.js',
        dist: 'dist/'
    },
    babel: {
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
    }
}

gulp.task('clean', () => del(config.paths.dist));

gulp.task('make:iife', () => {
    return rollupStream({
        input: config.paths.index,
        output: {
            format: 'iife',
            name: 'jazzer'
        },
        plugins: [
            rollupNodeResolve(),
            rollupBabel(config.babel)
        ],
        rollup: rollup
    })
    .pipe(source('jazzer.js'))
    .pipe(gulp.dest(config.paths.dist));
});

gulp.task('make:iife:min', () => {
    return rollupStream({
        input: config.paths.index,
        output: {
            format: 'iife',
            name: 'jazzer'
        },
        plugins: [
            rollupNodeResolve(),
            rollupBabel(config.babel),
            rollupUglify()
        ],
        rollup: rollup
    })
    .pipe(source('jazzer.min.js'))
    .pipe(gulp.dest(config.paths.dist));
});

gulp.task('make:es', () => {
    return rollupStream({
        input: config.paths.index,
        output: {
            format: 'es',
        },
        plugins: [
            rollupNodeResolve(),
            rollupBabel(config.babel)
        ],
        rollup: rollup
    })
    .pipe(source('jazzer.es.js'))
    .pipe(gulp.dest(config.paths.dist));
});

gulp.task('make:cjs', () => {
    return rollupStream({
        input: config.paths.index,
        output: {
            format: 'cjs',
        },
        plugins: [
            rollupNodeResolve(),
            rollupBabel(config.babel)
        ],
        rollup: rollup
    })
    .pipe(source('jazzer.cjs.js'))
    .pipe(gulp.dest(config.paths.dist));
});

gulp.task('make', gulp.series('make:iife', 'make:iife:min', 'make:es', 'make:cjs'));
gulp.task('watch', () => gulp.watch(config.paths.index, gulp.series('make')));
gulp.task('default', gulp.series('clean', 'make', 'watch'));
