const gulp = require('gulp');
const rollupBabel = require('rollup-plugin-babel');
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

gulp.task('make', () => {
    return rollupStream({
        input: config.paths.index,
        plugins: [
            rollupBabel(config.babel)
        ],
        rollup: rollup,
        format: 'iife',
        name: 'jazzer'
    })
    .pipe(source('jazzer.js'))
    .pipe(gulp.dest(config.paths.dist));
});

gulp.task('default', gulp.series('clean', 'make'));
