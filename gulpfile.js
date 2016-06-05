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
    neat        = require('node-neat').includePaths,
    reload      = browserSync.reload;

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html:  'build/',
        js:    'build/js/',
        libs:  'build/js/',
        css:   'build/css/',
        img:   'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html:  'src/*.html',
        js:    'src/js/*.js',
        libs:  'src/libs/*.js',
        style: 'src/style/main.scss',
        img:   'src/images/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html:  'src/**/*.html',
        js:    'src/js/**/*.js',
        libs:  'src/libs/*.js',
        style: 'src/style/**/**/*.scss',
        img:   'src/images/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    // tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: 'front-end-karachevtsev'
};

gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(plumber())
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
      .pipe(plumber())
      .pipe(rigger()) //Прогоним через rigger
        .pipe(concat('main.js'))
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write('./')) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('libs:build', function() {
    gulp.src(path.src.libs) //Найдем наш libs файл
        .pipe(plumber())
        .pipe(concat('libs.js'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src('src/style/main.scss') //Выберем наш main.scss
      .pipe(plumber())
      .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass({includePaths: ['src/style/**/*.scss']}))
        .pipe(prefixer('last 10 version'))
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('sprite', function() {
  var spriteData =
    gulp.src('./src/images/sprite/*.*') // путь, откуда берем картинки для спрайта
      .pipe(sprite({
        imgName: 'sprite.png',
        cssName: 'sprite.css',
      }));

  spriteData.img.pipe(gulp.dest('./src/images/'));  // путь, куда сохраняем картинку
  spriteData.css.pipe(gulp.dest('./src/style/'));  // путь, куда сохраняем стили
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