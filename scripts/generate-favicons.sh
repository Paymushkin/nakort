#!/bin/bash

# Скрипт для генерации favicon файлов из SVG
# Требуется ImageMagick: brew install imagemagick (macOS) или sudo apt-get install imagemagick (Linux)

cd "$(dirname "$0")/../src/static"

echo "Генерация favicon файлов из favicon.svg..."

# Проверка наличия ImageMagick
if ! command -v convert &> /dev/null; then
    echo "Ошибка: ImageMagick не установлен!"
    echo "Установите его:"
    echo "  macOS: brew install imagemagick"
    echo "  Linux: sudo apt-get install imagemagick"
    exit 1
fi

# Проверка наличия SVG файла
if [ ! -f "favicon.svg" ]; then
    echo "Ошибка: favicon.svg не найден в src/static/"
    exit 1
fi

# Генерация PNG файлов
echo "Создание favicon-16x16.png..."
convert -background none -resize 16x16 favicon.svg favicon-16x16.png

echo "Создание favicon-32x32.png..."
convert -background none -resize 32x32 favicon.svg favicon-32x32.png

echo "Создание apple-touch-icon.png..."
convert -background none -resize 180x180 favicon.svg apple-touch-icon.png

echo "Создание favicon-192x192.png..."
convert -background none -resize 192x192 favicon.svg favicon-192x192.png

echo "Создание favicon-512x512.png..."
convert -background none -resize 512x512 favicon.svg favicon-512x512.png

# Генерация ICO файла (опционально)
echo "Создание favicon.ico..."
convert favicon-16x16.png favicon-32x32.png favicon.ico

echo "Готово! Все favicon файлы созданы в src/static/"
echo "Перезапустите dev сервер: npm run dev"

