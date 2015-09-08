var gulp = require("gulp");
var tsd = require('gulp-tsd');
var bower = require('gulp-bower');
var typescript = require('gulp-typescript');
var runSequence = require('run-sequence');

gulp.task('default', function(callback){
    return runSequence(
        ['tsd', 'bower'],
        ['typescript-build'],
        callback);
});

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './public/javascripts/tsd.json'
    }, callback);
});

gulp.task('bower', function() {
    return bower({ directory: './bower_components', cwd: 'public/javascripts' });
});

gulp.task('typescript-build', function () {
    var config = {
        ts : {
            src: [
                '!./public/javascripts/bower_components/**', // node_modulesは対象外
                '!./public/javascripts/typings/**', // node_modulesは対象外
                './public/javascripts/**/*.ts'       // プロジェクトのルート以下すべてのディレクトリの.tsファイルを対象とする
            ],
            dst: './public/javascripts',
            options: { target: 'ES5', module: 'commonjs' }
        }
    };

    return gulp.src(config.ts.src)
        .pipe(typescript(config.ts.options))
        .js
        .pipe(gulp.dest(config.ts.dst));
});

