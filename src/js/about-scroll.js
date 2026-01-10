// Scroll-linked Animation для страницы About
// Плавная смена 30 изображений при скролле

(function() {
  'use strict';

  class AboutScrollAnimation {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.container = null;
      this.scrollSection = null;
      this.loader = null;
      
      // Animation settings
      this.totalFrames = 30; // Все 30 изображений
      this.framePrefix = 'ezgif-frame-';
      this.frameSuffix = '.jpg';
      this.framesPath = 'img/frames/';
      
      // Image preloading
      this.images = [];
      this.loadedImages = 0;
      this.isLoading = false;
      this.isLoaded = false;
      
      // Scroll tracking
      this.currentFrame = 0;
      this.scrollProgress = 0;
      this.ticking = false;
      
      // Canvas settings
      this.dpr = window.devicePixelRatio || 1;
      this.canvasWidth = 0;
      this.canvasHeight = 0;
      
      this.init();
    }

    init() {
      // Проверяем, что мы на странице About
      this.scrollSection = document.querySelector('.about-scroll');
      if (!this.scrollSection) return;

      this.canvas = document.getElementById('scrollCanvas');
      this.container = document.querySelector('.about-scroll__container');
      this.loader = document.querySelector('.about-scroll__loader');
      
      if (!this.canvas || !this.container) return;

      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) return;

      // Инициализируем canvas
      this.setupCanvas();
      
      // Загружаем изображения
      this.preloadImages();
      
      // Обработка ресайза
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.setupCanvas();
          if (this.isLoaded) {
            this.drawFrame(this.currentFrame);
          }
        }, 250);
      });
    }

    setupCanvas() {
      if (!this.canvas || !this.container) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Устанавливаем размеры canvas с учетом devicePixelRatio для четкости
      this.canvasWidth = width;
      this.canvasHeight = height;
      
      this.canvas.width = width * this.dpr;
      this.canvas.height = height * this.dpr;
      
      // Масштабируем контекст для четкого рендеринга
      this.ctx.scale(this.dpr, this.dpr);
      
      // Устанавливаем CSS размеры
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
    }

    // Preload всех изображений последовательности
    async preloadImages() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.loadedImages = 0;
      this.images = [];

      const loadPromises = [];

      for (let i = 1; i <= this.totalFrames; i++) {
        const frameNumber = String(i).padStart(3, '0');
        const imagePath = `${this.framesPath}${this.framePrefix}${frameNumber}${this.frameSuffix}`;
        
        const promise = new Promise((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            this.loadedImages++;
            this.updateLoaderProgress();
            resolve(img);
          };
          
          img.onerror = () => {
            console.warn(`Failed to load frame: ${imagePath}`);
            // Создаем пустое изображение в случае ошибки
            const errorImg = new Image();
            errorImg.width = 1920;
            errorImg.height = 1080;
            this.loadedImages++;
            this.updateLoaderProgress();
            resolve(errorImg);
          };
          
          img.src = imagePath;
        });

        loadPromises.push(promise);
      }

      try {
        this.images = await Promise.all(loadPromises);
        this.isLoaded = true;
        this.isLoading = false;
        this.hideLoader();
        this.startAnimation();
      } catch (error) {
        console.error('Error loading images:', error);
        this.isLoading = false;
        this.hideLoader();
      }
    }

    updateLoaderProgress() {
      if (!this.loader) return;
      
      const progress = Math.round((this.loadedImages / this.totalFrames) * 100);
      const loaderText = this.loader.querySelector('.about-scroll__loader-text');
      
      if (loaderText) {
        loaderText.textContent = `Загрузка... ${progress}%`;
      }
    }

    hideLoader() {
      if (!this.loader) return;
      
      setTimeout(() => {
        this.loader.classList.add('about-scroll__loader--hidden');
        
        // Удаляем loader из DOM после анимации
        setTimeout(() => {
          if (this.loader.parentNode) {
            this.loader.parentNode.removeChild(this.loader);
          }
        }, 500);
      }, 300);
    }

    startAnimation() {
      if (!this.isLoaded || !this.canvas || !this.ctx) return;

      // Рисуем первый кадр
      this.drawFrame(0);
      
      // Начинаем отслеживание скролла
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      this.onScroll();
    }

    onScroll() {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.updateScrollProgress();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }

    updateScrollProgress() {
      if (!this.scrollSection || !this.container) return;

      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const sectionTop = this.scrollSection.offsetTop;
      const sectionHeight = this.scrollSection.offsetHeight;
      
      // Вычисляем прогресс скролла для sticky canvas
      // Canvas sticky остается на месте пока секция прокручивается
      // Анимация начинается когда верх секции достигает верха экрана
      // Анимация заканчивается когда мы прошли всю высоту секции (300vh)
      // После этого canvas "отпускается" и скролл продолжается
      
      // Начало анимации: когда верх секции достигает верха экрана
      const scrollStart = sectionTop;
      // Конец анимации: когда мы прошли всю высоту секции
      // Учитываем, что sticky элемент остается на месте пока секция прокручивается
      const scrollEnd = sectionTop + sectionHeight - windowHeight;
      const scrollRange = scrollEnd - scrollStart;
      
      // Прогресс скролла от 0 до 1 в пределах секции
      let progress = 0;
      if (scrollY < scrollStart) {
        // Еще не дошли до секции - показываем первый кадр
        progress = 0;
      } else if (scrollY >= scrollEnd) {
        // Прошли всю секцию - показываем последний кадр
        progress = 1;
      } else {
        // Внутри секции - вычисляем прогресс от 0 до 1
        progress = (scrollY - scrollStart) / scrollRange;
      }
      
      this.scrollProgress = progress;
      
      // Вычисляем текущий кадр (0 to totalFrames - 1)
      // Плавно переходим от первого к последнему изображению через все 30 кадров
      const frameIndex = Math.round(progress * (this.totalFrames - 1));
      this.currentFrame = Math.max(0, Math.min(this.totalFrames - 1, frameIndex));
      
      // Рисуем текущий кадр
      if (this.isLoaded && this.images[this.currentFrame]) {
        this.drawFrame(this.currentFrame);
      }
    }

    drawFrame(frameIndex) {
      if (!this.ctx || !this.canvas || !this.images[frameIndex]) return;

      const img = this.images[frameIndex];
      
      // Очищаем canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Вычисляем размеры изображения для правильного масштабирования (contain fit)
      const imgAspect = img.width / img.height;
      const canvasAspect = this.canvasWidth / this.canvasHeight;
      
      let drawWidth = this.canvasWidth;
      let drawHeight = this.canvasHeight;
      let drawX = 0;
      let drawY = 0;
      
      if (imgAspect > canvasAspect) {
        // Изображение шире - подгоняем по ширине
        drawHeight = this.canvasWidth / imgAspect;
        drawY = (this.canvasHeight - drawHeight) / 2;
      } else {
        // Изображение выше - подгоняем по высоте
        drawWidth = this.canvasHeight * imgAspect;
        drawX = (this.canvasWidth - drawWidth) / 2;
      }
      
      // Рисуем изображение
      this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
  }

  // Инициализация при загрузке DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new AboutScrollAnimation();
    });
  } else {
    new AboutScrollAnimation();
  }
})();
