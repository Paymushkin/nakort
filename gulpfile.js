const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin').default || require('gulp-imagemin');
const webp = require('gulp-webp');
const replace = require('gulp-replace');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const del = require('del');
const ttf2woff2 = require('gulp-ttf2woff2');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');

const paths = {
  src: {
    pug: 'src/pug/**/*.pug',
    scss: 'src/scss/**/*.scss',
    js: 'src/js/**/*.js',
    css: 'src/css/**/*.css',
    img: 'src/img/**/*.{jpg,jpeg,png,gif,svg,webp}',
    fonts: 'src/fonts/**/*.{ttf,otf,woff,woff2}',
    static: 'src/static/**/*'
  },
  dist: {
    base: 'dist',
    html: 'dist',
    css: 'dist/css',
    js: 'dist/js',
    img: 'dist/img',
    fonts: 'dist/fonts',
    static: 'dist'
  },
  temp: {
    webp: 'temp/webp',
    fonts: 'temp/fonts'
  }
};

// Очистка
function clean() {
  return del(['dist', 'temp']);
}

// Компиляция Pug (исключаем includes и layout)
function compilePug() {
  return gulp.src(['src/pug/**/*.pug', '!src/pug/includes/**/*.pug', '!src/pug/layout.pug'])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(paths.dist.html))
    .pipe(browserSync.stream());
}

// Компиляция SCSS
function compileSass() {
  return gulp.src('src/scss/main.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream());
}

// Минификация CSS для production
function minifyCSS() {
  return gulp.src('src/scss/main.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(postcss([cssnano()]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist.css));
}

// Обработка JavaScript (для разработки - без минификации)
function processJS() {
  return gulp.src([
    'src/js/scroll-animations.js',
    'src/js/carousel.js',
    'src/js/modal.js',
    'src/js/main.js'
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
}

// Копирование about-scroll.js (отдельный файл для страницы about)
function copyAboutScrollJS() {
  return gulp.src('src/js/about-scroll.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
}

// Копирование Swiper JS (отдельно, не объединяем с main.js)
function copySwiperJS() {
  return gulp.src('src/js/swiper.min.js')
    .pipe(plumber())
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
}

// Обработка JavaScript (для production - с минификацией)
function processJSProd() {
  return gulp.src([
    'src/js/scroll-animations.js',
    'src/js/carousel.js',
    'src/js/modal.js',
    'src/js/main.js'
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.js));
}

// Копирование about-scroll.js для production
function copyAboutScrollJSProd() {
  return gulp.src('src/js/about-scroll.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(paths.dist.js))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.js));
}

// Копирование Swiper JS для production
function copySwiperJSProd() {
  return gulp.src('src/js/swiper.min.js')
    .pipe(plumber())
    .pipe(gulp.dest(paths.dist.js));
}

// Копирование изображений (для разработки - без оптимизации)
function copyImages() {
  return gulp.src(paths.src.img, { base: 'src' })
    .pipe(plumber())
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
}

// Оптимизация изображений (для production)
function optimizeImages() {
  const imageminPlugins = require('gulp-imagemin');
  const imageminDefault = imagemin.default || imagemin;
  return gulp.src(paths.src.img, { base: 'src' })
    .pipe(plumber())
    .pipe(imageminDefault([
      imageminPlugins.mozjpeg({ quality: 85, progressive: true }),
      imageminPlugins.optipng({ optimizationLevel: 5 }),
      imageminPlugins.svgo({
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'cleanupIDs', active: false }
        ]
      })
    ]))
    .pipe(gulp.dest('dist'));
}

// Конвертация изображений в WebP
function convertToWebp() {
  return gulp.src(paths.src.img)
    .pipe(plumber())
    .pipe(webp({ quality: 85 }))
    .pipe(gulp.dest(paths.temp.webp));
}

// Замена путей к изображениям в HTML на WebP (только в background-image и других CSS свойствах)
function replaceImagesInHTML() {
  return gulp.src(`${paths.dist.html}/**/*.html`)
    .pipe(replace(/url\(['"]?([^'"]*?)\.(jpg|jpeg|png|gif)(\?[^'"]*)?['"]?\)/gi, "url('$1.webp$3')"))
    .pipe(gulp.dest(paths.dist.html));
}

// Замена путей к изображениям в CSS на WebP
function replaceImagesInCSS() {
  return gulp.src(`${paths.dist.css}/**/*.css`)
    .pipe(replace(/url\(['"]?([^'"]*?)\.(jpg|jpeg|png|gif)(\?[^'"]*)?['"]?\)/gi, "url('$1.webp$3')"))
    .pipe(gulp.dest(paths.dist.css));
}

// Замена img на picture с WebP
function replaceImgWithPicture() {
  return gulp.src(`${paths.dist.html}/**/*.html`)
    .pipe(replace(
      /<img([^>]*?)src="([^"]*?)\.(jpg|jpeg|png|gif)"([^>]*?)>/gi,
      (match, before, src, ext, after) => {
        // Извлекаем атрибуты
        const allAttrs = before + after;
        const altMatch = allAttrs.match(/alt="([^"]*?)"/i);
        const altText = altMatch ? altMatch[1] : '';
        const classMatch = allAttrs.match(/class="([^"]*?)"/i);
        const className = classMatch ? classMatch[1] : '';
        const loadingMatch = allAttrs.match(/loading="([^"]*?)"/i);
        const loadingValue = loadingMatch ? loadingMatch[1] : 'lazy';
        
        // Собираем остальные атрибуты (кроме src, alt, class, loading)
        const otherAttrs = allAttrs
          .replace(/src="[^"]*"/gi, '')
          .replace(/alt="[^"]*"/gi, '')
          .replace(/class="[^"]*"/gi, '')
          .replace(/loading="[^"]*"/gi, '')
          .trim();
        
        // Формируем picture элемент
        const pictureClass = className ? ` class="${className}"` : '';
        const imgAttrs = otherAttrs ? ` ${otherAttrs}` : '';
        
        return `<picture${pictureClass}>
  <source srcset="${src}.webp" type="image/webp">
  <img src="${src}.${ext}" alt="${altText}" loading="${loadingValue}"${imgAttrs}>
</picture>`;
      }
    ))
    .pipe(gulp.dest(paths.dist.html));
}

// Копирование WebP изображений в dist
function copyWebpImages() {
  return gulp.src(`${paths.temp.webp}/**/*.webp`)
    .pipe(gulp.dest(paths.dist.img));
}

// Конвертация шрифтов в WOFF2
function convertFonts() {
  return gulp.src(paths.src.fonts)
    .pipe(plumber())
    .pipe(ttf2woff2())
    .pipe(gulp.dest(paths.temp.fonts));
}

// Копирование шрифтов
function copyFonts() {
  return gulp.src(paths.src.fonts)
    .pipe(gulp.dest(paths.dist.fonts));
}

// Копирование конвертированных шрифтов
function copyConvertedFonts() {
  return gulp.src(`${paths.temp.fonts}/**/*.woff2`)
    .pipe(gulp.dest(paths.dist.fonts));
}

// Замена путей к шрифтам в CSS на WOFF2
function replaceFontsInCSS() {
  return gulp.src(`${paths.dist.css}/**/*.css`)
    .pipe(replace(/\.(ttf|otf|woff)(\?.*)?/gi, '.woff2$2'))
    .pipe(replace(/format\('?(ttf|otf|woff)'?\)/gi, "format('woff2')"))
    .pipe(gulp.dest(paths.dist.css));
}

// Копирование CSS файлов (swiper.min.css и другие)
function copyCSS() {
  return gulp.src(paths.src.css)
    .pipe(plumber())
    .pipe(gulp.dest(paths.dist.css))
    .pipe(browserSync.stream());
}

// Копирование статических файлов (favicon, manifest и т.д.)
function copyStatic() {
  return gulp.src(paths.src.static)
    .pipe(gulp.dest(paths.dist.base)) // Копируем в корень dist для favicon
    .pipe(browserSync.stream());
}

// Минификация HTML
function minifyHTML() {
  return gulp.src(`${paths.dist.html}/**/*.html`)
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true
    }))
    .pipe(gulp.dest(paths.dist.html));
}

// Browser Sync
function serve() {
  browserSync.init({
    server: {
      baseDir: paths.dist.base
    },
    notify: false,
    open: true,
    port: 3000
  });
}

// Наблюдение за изменениями
function watch() {
  // Отслеживание всех Pug файлов - при изменении includes перекомпилируются все страницы
  // При изменении includes перекомпилируются все pug файлы (но includes не компилируются отдельно)
  gulp.watch('src/pug/**/*.pug', compilePug);
  
  // Отслеживание SCSS файлов - компиляция и перезагрузка (через stream)
  gulp.watch(paths.src.scss, compileSass);
  
  // Отслеживание JS файлов - обработка и перезагрузка (через stream, без минификации)
  // Исключаем swiper.min.js и about-scroll.js (они обрабатываются отдельно)
  gulp.watch(['src/js/**/*.js', '!src/js/swiper.min.js', '!src/js/about-scroll.js'], processJS);
  
  // Отслеживание about-scroll.js отдельно
  gulp.watch('src/js/about-scroll.js', copyAboutScrollJS);
  
  // Отслеживание изображений - быстрое копирование без оптимизации (через stream)
  gulp.watch(paths.src.img, copyImages);
  
  // Отслеживание CSS файлов - копирование и перезагрузка (через stream)
  gulp.watch(paths.src.css, copyCSS);
  
  // Отслеживание статических файлов - копирование и перезагрузка (через stream)
  gulp.watch(paths.src.static, copyStatic);
  
  // Отслеживание Swiper JS - копирование и перезагрузка (через stream)
  gulp.watch('src/js/swiper.min.js', copySwiperJS);
  
  // Отслеживание HTML файлов в dist (на случай прямого редактирования)
  gulp.watch(`${paths.dist.html}/**/*.html`).on('change', browserSync.reload);
}

// Задача конвертации (изображения и шрифты)
const convert = gulp.series(
  convertToWebp,
  convertFonts
);

// Задача сборки с конвертацией
const buildWithConvert = gulp.series(
  clean,
  gulp.parallel(compilePug, compileSass, processJSProd, copySwiperJSProd, copyAboutScrollJSProd, copyCSS, optimizeImages, copyFonts, copyStatic),
  convert,
  copyWebpImages,
  copyConvertedFonts,
  replaceImgWithPicture,
  replaceImagesInHTML,
  replaceImagesInCSS,
  replaceFontsInCSS,
  minifyCSS,
  minifyHTML
);

// Задача сборки без конвертации
const build = gulp.series(
  clean,
  gulp.parallel(compilePug, compileSass, processJSProd, copySwiperJSProd, copyAboutScrollJSProd, copyCSS, optimizeImages, copyFonts, copyStatic),
  minifyCSS,
  minifyHTML
);

// Задача разработки
const dev = gulp.series(
  clean,
  gulp.parallel(compilePug, compileSass, processJS, copySwiperJS, copyAboutScrollJS, copyCSS, copyImages, copyFonts, copyStatic),
  gulp.parallel(serve, watch)
);

// Экспорт задач
exports.clean = clean;
exports.convert = convert;
exports.build = build;
exports.buildWithConvert = buildWithConvert;
exports.dev = dev;
exports.default = dev;

