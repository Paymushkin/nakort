// Универсальный класс для каруселей
class Carousel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      // Тихая проверка - не выводим предупреждение, если элемент не найден
      return;
    }

    // Настройки по умолчанию
    this.options = {
      slideSelector: '.carousel__slide',
      activeClass: 'carousel__slide--active',
      dotSelector: '.carousel__dot',
      dotActiveClass: 'carousel__dot--active',
      prevBtnSelector: '.carousel__nav-btn--prev',
      nextBtnSelector: '.carousel__nav-btn--next',
      autoplayInterval: 5000,
      pauseOnHover: true,
      ...options
    };

    this.slides = this.container.querySelectorAll(this.options.slideSelector);
    this.dots = this.container.querySelectorAll(this.options.dotSelector);
    this.prevBtn = this.container.querySelector(this.options.prevBtnSelector);
    this.nextBtn = this.container.querySelector(this.options.nextBtnSelector);
    
    this.currentSlide = 0;
    this.autoplayInterval = null;
    this.isPaused = false;

    if (this.slides.length === 0) {
      console.warn('Carousel: слайды не найдены');
      return;
    }

    this.init();
  }

  init() {
    this.showSlide(this.currentSlide);
    this.attachEvents();
    
    if (this.options.autoplayInterval > 0) {
      this.startAutoplay();
    }
  }

  showSlide(index) {
    if (index < 0 || index >= this.slides.length) return;

    const isHero = this.container.classList.contains('hero__carousel');
    const prevClass = isHero ? 'hero__slide--prev' : 'carousel__slide--prev';
    const nextClass = isHero ? 'hero__slide--next' : 'carousel__slide--next';

    // Убираем все классы состояния
    this.slides.forEach((slide, i) => {
      slide.classList.remove(this.options.activeClass);
      slide.classList.remove(prevClass);
      slide.classList.remove(nextClass);
      
      if (i === index) {
        slide.classList.add(this.options.activeClass);
      } else if (i < index) {
        slide.classList.add(prevClass);
      } else {
        slide.classList.add(nextClass);
      }
    });
    
    // Убираем активный класс со всех точек
    if (this.dots.length > 0) {
      this.dots.forEach((dot, i) => {
        dot.classList.toggle(this.options.dotActiveClass, i === index);
      });
    }

    this.currentSlide = index;
  }

  nextSlide() {
    const next = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(next);
  }

  prevSlide() {
    const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prev);
  }

  goToSlide(index) {
    if (index >= 0 && index < this.slides.length) {
      this.showSlide(index);
    }
  }

  startAutoplay() {
    if (this.autoplayInterval) {
      this.stopAutoplay();
    }
    
    this.autoplayInterval = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, this.options.autoplayInterval);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  pauseAutoplay() {
    this.isPaused = true;
  }

  resumeAutoplay() {
    this.isPaused = false;
  }

  attachEvents() {
    // Кнопка "Следующий"
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.nextSlide();
        this.restartAutoplay();
      });
    }

    // Кнопка "Предыдущий"
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prevSlide();
        this.restartAutoplay();
      });
    }

    // Точки навигации
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
        this.restartAutoplay();
      });
    });

    // Пауза при наведении
    if (this.options.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => {
        this.pauseAutoplay();
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.resumeAutoplay();
      });
    }
  }

  restartAutoplay() {
    if (this.options.autoplayInterval > 0) {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }

  destroy() {
    this.stopAutoplay();
    // Здесь можно добавить удаление обработчиков событий при необходимости
  }
}

// Функция для инициализации карусели с настройками для hero
function initHeroCarousel() {
  const carousel = new Carousel('.hero__carousel', {
    slideSelector: '.hero__slide',
    activeClass: 'hero__slide--active',
    dotSelector: '.hero__dot',
    dotActiveClass: 'hero__dot--active',
    prevBtnSelector: '.hero__nav-btn--prev',
    nextBtnSelector: '.hero__nav-btn--next',
    autoplayInterval: 5000,
    pauseOnHover: true
  });
}

// Функция для инициализации reviews карусели с Swiper
function initReviewsCarousel() {
  if (typeof Swiper === 'undefined') {
    console.warn('Swiper не загружен');
    return;
  }
  
  const reviewsCarousel = document.querySelector('.reviews__carousel');
  if (!reviewsCarousel) {
    // Тихая проверка - элемент не найден, возможно это не страница с reviews
    return;
  }
  
  const reviewsSwiper = new Swiper('.reviews__carousel', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      navigation: {
        nextEl: '.reviews__nav-btn--next',
        prevEl: '.reviews__nav-btn--prev'
      },
      breakpoints: {
        992: {
          slidesPerView: 3,
          spaceBetween: 20
        }
      }
    });
}

// Функция для инициализации certificates карусели с Swiper
function initCertificatesCarousel() {
  if (typeof Swiper === 'undefined') {
    console.warn('Swiper не загружен');
    return;
  }
  
  // Инициализация для каждой панели (tennis и padel)
  const certificatesPanels = document.querySelectorAll('.certificates__panel');
  if (certificatesPanels.length === 0) {
    // Тихая проверка - элементы не найдены, возможно это не страница с certificates
    return;
  }
  
  const certificatesContent = document.querySelector('.certificates__content');
  
  certificatesPanels.forEach((panel) => {
      const carousel = panel.querySelector('.certificates__carousel');
      if (carousel) {
        // Определяем тип панели (tennis или padel)
        const panelName = panel.getAttribute('data-panel');
        
        // Ищем соответствующую навигацию по модификатору
        let nextBtn = null;
        let prevBtn = null;
        
        if (certificatesContent) {
          const nav = certificatesContent.querySelector(`.certificates__nav--${panelName}`);
          if (nav) {
            nextBtn = nav.querySelector('.certificates__nav-btn--next');
            prevBtn = nav.querySelector('.certificates__nav-btn--prev');
          }
        }
        
        // Если не нашли в навигации, ищем внутри панели
        if (!nextBtn) {
          nextBtn = panel.querySelector('.certificates__nav-btn--next');
        }
        if (!prevBtn) {
          prevBtn = panel.querySelector('.certificates__nav-btn--prev');
        }
        
        new Swiper(carousel, {
          slidesPerView: 1,
          spaceBetween: 20,
          navigation: {
            nextEl: nextBtn,
            prevEl: prevBtn
          },
          breakpoints: {
            992: {
              slidesPerView: 2.5,
              spaceBetween: 20
            }
          }
        });
      }
    });
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Carousel, initHeroCarousel, initReviewsCarousel, initCertificatesCarousel };
}

