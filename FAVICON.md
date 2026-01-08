# Инструкция по созданию Favicon файлов

Для полной поддержки favicon на всех устройствах и браузерах необходимо создать следующие файлы из `src/static/favicon.svg`:

## Необходимые файлы:

1. **favicon.svg** - уже создан (современные браузеры)
2. **favicon-16x16.png** - 16x16 пикселей
3. **favicon-32x32.png** - 32x32 пикселей  
4. **apple-touch-icon.png** - 180x180 пикселей (для iOS)
5. **favicon-192x192.png** - 192x192 пикселей (для Android)
6. **favicon-512x512.png** - 512x512 пикселей (для PWA)

## Способы генерации:

### Вариант 1: Онлайн инструменты
1. Используйте [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Загрузите `src/static/favicon.svg`
3. Скачайте сгенерированные файлы
4. Поместите их в `src/static/`

### Вариант 2: ImageMagick (командная строка)
```bash
# Установите ImageMagick (если не установлен)
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Генерация PNG файлов
cd src/static
convert -background none -resize 16x16 favicon.svg favicon-16x16.png
convert -background none -resize 32x32 favicon.svg favicon-32x32.png
convert -background none -resize 180x180 favicon.svg apple-touch-icon.png
convert -background none -resize 192x192 favicon.svg favicon-192x192.png
convert -background none -resize 512x512 favicon.svg favicon-512x512.png

# Генерация ICO файла (опционально)
convert favicon-16x16.png favicon-32x32.png favicon.ico
```

### Вариант 3: Inkscape (графический редактор)
1. Откройте `src/static/favicon.svg` в Inkscape
2. Файл → Экспортировать как PNG
3. Установите нужный размер и экспортируйте

## Размещение файлов:

Все файлы должны быть в `src/static/` - они автоматически скопируются в `dist/` при сборке.

## Проверка:

После создания файлов перезапустите dev сервер:
```bash
npm run dev
```

Favicon должен появиться во вкладке браузера.

