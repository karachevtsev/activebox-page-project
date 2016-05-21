'use strict';

var gulp        = require('gulp'),
    rigger      = require('gulp-rigger'),
    plumber     = require('gulp-plumber'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    prefixer    = require('gulp-autoprefixer'),
    cssmin      = require('gulp-clean-css'),
    watch       = require('gulp-watch'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    sprite      = require('gulp.spritesmith'),
    rimraf      = require('rimraf'),
    browserSync = require("browser-sync"),
    reload      = browserSync.reload;

var path = {
    build: {
        html:  'build/',
        js:    'build/js/',
        libs:  'build/js/',
        css:   'build/css/',
        img:   'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html:  'src/*.html',
        js:    'src/js/*.js',
        libs:  'src/libs/*.js',
        style: 'src/style/**/*.scss',
        img:   'src/images/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html:  'src/**/*.html',
        js:    'src/js/**/*.js',
        libs:  'src/libs/*.js',
        style: 'src/style/**/*.*',
        img:   'src/images/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: 'front-end-karachevtsev'
};

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
      .pipe(plumber())
      .pipe(rigger())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('libs:build', function() {
     gulp.src(path.src.libs)
        .pipe(plumber())
        .pipe(concat('libs.js'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
      .pipe(plumber())
      .pipe(sourcemaps.init())
        .pipe(sass({
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer({
            browsers: ['last 10 versions'],
            cascade: true
        }))
        .pipe(cssmin())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('sprite', function() {
    var spriteData =
        gulp.src('./src/images/sprite/*.*')
          .pipe(sprite({
            imgName: 'sprite.png',
            cssName: 'sprite.css',
        }));

        spriteData.img.pipe(gulp.dest('./src/images/'));
        spriteData.css.pipe(gulp.dest('./src/style/'));
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build'
]);

gulp.task('pre-build', [
    'fonts:build',
    'sprite',
    'image:build',
    'libs:build',
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('default', ['build', 'webserver', 'watch']);