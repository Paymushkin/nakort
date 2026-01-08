// Легкая библиотека для анимаций при скролле на основе Intersection Observer
(function() {
  'use strict';

  class ScrollAnimations {
    constructor(options = {}) {
      this.options = {
        threshold: options.threshold || 0.2,
        rootMargin: options.rootMargin || '0px',
        once: options.once !== false, // По умолчанию анимация срабатывает один раз
        ...options
      };
      
      this.observer = null;
      this.init();
    }

    init() {
      if (!('IntersectionObserver' in window)) {
        // Fallback для старых браузеров
        this.fallback();
        return;
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const animationClass = element.dataset.scrollAnimation || 'scroll-animation--visible';
            
            element.classList.add(animationClass);
            
            if (this.options.once) {
              this.observer.unobserve(element);
            }
          } else if (!this.options.once) {
            // Если once: false, убираем класс при выходе из viewport
            const element = entry.target;
            const animationClass = element.dataset.scrollAnimation || 'scroll-animation--visible';
            element.classList.remove(animationClass);
          }
        });
      }, {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      });
    }

    observe(element, customOptions = {}) {
      if (!element) return;

      const options = { ...this.options, ...customOptions };
      
      if (this.observer) {
        // Если нужны кастомные опции для конкретного элемента
        if (Object.keys(customOptions).length > 0) {
          const customObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const el = entry.target;
                const animationClass = el.dataset.scrollAnimation || 'scroll-animation--visible';
                el.classList.add(animationClass);
                
                if (options.once) {
                  customObserver.unobserve(el);
                }
              } else if (!options.once) {
                const el = entry.target;
                const animationClass = el.dataset.scrollAnimation || 'scroll-animation--visible';
                el.classList.remove(animationClass);
              }
            });
          }, {
            threshold: options.threshold,
            rootMargin: options.rootMargin
          });
          
          customObserver.observe(element);
          return;
        }
        
        this.observer.observe(element);
      } else {
        this.fallbackElement(element);
      }
    }

    observeAll(selector, customOptions = {}) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => this.observe(el, customOptions));
    }

    unobserve(element) {
      if (this.observer && element) {
        this.observer.unobserve(element);
      }
    }

    fallback() {
      // Для старых браузеров просто добавляем классы сразу
      const elements = document.querySelectorAll('[data-scroll-animation]');
      elements.forEach(el => {
        const animationClass = el.dataset.scrollAnimation || 'scroll-animation--visible';
        el.classList.add(animationClass);
      });
    }

    fallbackElement(element) {
      const animationClass = element.dataset.scrollAnimation || 'scroll-animation--visible';
      element.classList.add(animationClass);
    }
  }

  // Создаем глобальный экземпляр
  window.ScrollAnimations = ScrollAnimations;

  // Автоматическая инициализация при загрузке DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }

  function initScrollAnimations() {
    // Создаем дефолтный экземпляр
    window.scrollAnimations = new ScrollAnimations({
      threshold: 0.2,
      rootMargin: '0px',
      once: true
    });

    // Автоматически наблюдаем за элементами с data-scroll-animation
    window.scrollAnimations.observeAll('[data-scroll-animation]');
  }
})();

// Универсальный класс для каруселей
class Carousel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      console.warn('Carousel: контейнер не найден');
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
  if (typeof Swiper !== 'undefined') {
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
}

// Функция для инициализации certificates карусели с Swiper
function initCertificatesCarousel() {
  if (typeof Swiper !== 'undefined') {
    // Инициализация для каждой панели (tennis и padel)
    const certificatesPanels = document.querySelectorAll('.certificates__panel');
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
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Carousel, initHeroCarousel, initReviewsCarousel, initCertificatesCarousel };
}


// Функция для управления модальными окнами
(function() {
  'use strict';

  // Функция открытия модального окна
  // Принимает значение data-modal (например, "training" или "certificate")
  function openModal(modalType) {
    if (!modalType) return;

    // Ищем модальное окно по атрибуту data-popup
    const modal = document.querySelector(`[data-popup="${modalType}"]`);
    
    if (modal) {
      // Закрываем все открытые модальные окна
      document.querySelectorAll('.modal').forEach(m => {
        m.classList.remove('modal--active');
      });
      
      modal.classList.add('modal--active');
      document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
    }
  }

  // Функция закрытия модального окна
  // Может принимать тип модального окна или закрыть активное
  function closeModal(modalType) {
    let modal;
    
    if (modalType) {
      // Закрываем конкретное модальное окно по типу
      modal = document.querySelector(`[data-popup="${modalType}"]`);
    } else {
      // Закрываем активное модальное окно
      modal = document.querySelector('.modal--active');
    }
    
    if (modal) {
      modal.classList.remove('modal--active');
      document.body.style.overflow = ''; // Разблокируем скролл страницы
      
      const modalForm = modal.querySelector('.modal__form');
      if (modalForm) {
        modalForm.reset(); // Сбрасываем форму
      }
    }
  }

  // Инициализация модального окна
  function initModal(modalType) {
    const modal = document.querySelector(`[data-popup="${modalType}"]`);
    if (!modal) return;

    const modalClose = modal.querySelector('.modal__close');
    const modalOverlay = modal.querySelector('.modal__overlay');
    const modalForm = modal.querySelector('.modal__form');

    // Закрытие по клику на overlay
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => closeModal(modalType));
    }

    // Закрытие по клику на кнопку закрытия
    if (modalClose) {
      modalClose.addEventListener('click', () => closeModal(modalType));
    }

    // Обработка отправки формы
    if (modalForm) {
      modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Здесь можно добавить отправку данных на сервер
        // closeModal(modalType);
      });
    }
  }

  // Закрытие по нажатию Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal--active');
      if (activeModal) {
        const modalType = activeModal.getAttribute('data-popup');
        closeModal(modalType);
      }
    }
  });

  // Инициализация модальных окон и обработчиков
  function initModals() {
    // Находим все модальные окна и инициализируем их
    const modals = document.querySelectorAll('[data-popup]');
    modals.forEach(modal => {
      const modalType = modal.getAttribute('data-popup');
      if (modalType) {
        initModal(modalType);
      }
    });

    // Функция для добавления обработчиков на элементы с data-modal
    function attachHandlers() {
      const triggers = document.querySelectorAll('[data-modal]');
      
      triggers.forEach((trigger) => {
        const modalType = trigger.getAttribute('data-modal');
        
        if (modalType && modalType.trim() !== '') {
          // Удаляем старый обработчик, если есть
          if (trigger._modalClickHandler) {
            trigger.removeEventListener('click', trigger._modalClickHandler);
          }
          
          // Создаем новый обработчик
          trigger._modalClickHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            openModal(modalType);
          };
          
          // Добавляем обработчик
          trigger.addEventListener('click', trigger._modalClickHandler, true);
        }
      });
    }

    // Добавляем обработчики сразу
    attachHandlers();

    // Также используем делегирование событий для обработки кликов на динамически созданные элементы
    document.addEventListener('click', function(e) {
      // Проверяем, был ли клик на элементе с data-modal или его дочернем элементе
      const trigger = e.target.closest('[data-modal]');
      
      if (trigger) {
        const modalType = trigger.getAttribute('data-modal');
        
        // Проверяем, что data-modal имеет значение
        if (modalType && modalType.trim() !== '') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          // Открываем модальное окно с соответствующим data-popup
          openModal(modalType);
        }
      }
    }, true); // Capture phase - перехватываем событие до всплытия

    // Повторно добавляем обработчики через небольшую задержку (на случай динамической загрузки)
    setTimeout(attachHandlers, 100);
    setTimeout(attachHandlers, 500);
  }

  // Инициализация при загрузке DOM
  function tryInit() {
    const hasModals = document.querySelectorAll('[data-popup]').length > 0;
    
    if (hasModals || document.readyState !== 'loading') {
      initModals();
    } else {
      setTimeout(tryInit, 100);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    // DOM уже загружен
    tryInit();
  }
  
  // Дополнительная проверка через задержку (на случай динамической загрузки)
  setTimeout(() => {
    const triggers = document.querySelectorAll('[data-modal]');
    if (triggers.length > 0) {
      initModals();
    }
  }, 500);

  // Экспорт функций для глобального использования
  window.openModal = openModal;
  window.closeModal = closeModal;
})();


// Основной JavaScript файл

// Lazy loading изображений
document.addEventListener('DOMContentLoaded', function() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback для старых браузеров
    lazyImages.forEach(img => {
      img.classList.add('loaded');
    });
  }
});

// Плавная прокрутка для якорных ссылок
// Используем делегирование событий и проверяем data-modal в начале
// Выполняем в capture phase, но после modal.js (который тоже в capture phase)
// Поэтому проверяем data-modal первым делом
document.addEventListener('click', function(e) {
  // Пропускаем элементы с data-modal - они обрабатываются модальным окном
  // Проверяем и сам элемент, и его родителя
  if (e.target.closest('[data-modal]')) {
    return; // Пропускаем, пусть modal.js обработает
  }
  
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) {
    return;
  }
  
  // Дополнительная проверка: если это ссылка с data-modal, пропускаем
  if (anchor.hasAttribute('data-modal')) {
    return;
  }
  
  const href = anchor.getAttribute('href');
  // Пропускаем ссылки, которые не являются реальными якорями (#, #!, и т.д.)
  if (!href || href === '#' || href.length <= 1) {
    return; // Позволяем обработчику модального окна или другому обработчику обработать клик
  }
  
  e.preventDefault();
  const target = document.querySelector(href);
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}, true); // Используем capture phase, но modal.js должен быть загружен раньше

// Мобильное меню (если нужно)
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav__list');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('nav__list--open');
  });
}

// Общая функция для отслеживания скролла к определенной позиции экрана (туда-обратно)
function initScrollToCenterAnimation(element, visibleClass, options = {}) {
  if (!element) return;

  // Получаем позицию из data-атрибута или опций
  const scrollPosition = element.getAttribute('data-scroll-position') || options.position || 'center';
  
  let ticking = false;

  function checkPosition() {
    const rect = element.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const elementBottom = rect.bottom;
    const viewportHeight = window.innerHeight;
    
    let shouldBeVisible = false;
    
    if (scrollPosition === 'bottom') {
      // Нижняя треть экрана - анимация начинается когда элемент достигает нижней трети
      // и остается активной пока элемент виден, отключается когда уходит за нижнюю границу
      const bottomThirdThreshold = viewportHeight * (2 / 3); // 66.67% от верха = нижняя треть
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      
      // Анимация запускается когда верх элемента достиг нижней трети экрана
      // и остается активной пока элемент виден (нижняя граница выше низа экрана)
      // Отключается когда элемент полностью уходит за нижнюю границу экрана
      shouldBeVisible = elementTop <= bottomThirdThreshold && elementBottom > 0;
    } else {
      // По умолчанию - центр экрана
      const viewportCenter = viewportHeight / 2;
      shouldBeVisible = elementCenter <= viewportCenter;
    }

    if (shouldBeVisible) {
      element.classList.add(visibleClass);
    } else {
      element.classList.remove(visibleClass);
    }
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkPosition();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll);
  checkPosition(); // Проверяем начальную позицию
}

// Инициализация каруселей после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация hero карусели
  if (typeof initHeroCarousel === 'function') {
    initHeroCarousel();
  }

  // Инициализация reviews карусели
  if (typeof initReviewsCarousel === 'function') {
    initReviewsCarousel();
  }

  // Инициализация certificates карусели
  if (typeof initCertificatesCarousel === 'function') {
    initCertificatesCarousel();
  }

  // Универсальная функция для инициализации табов
  function initTabs(options = {}) {
    const {
      tabSelector = '[data-tab]',
      panelSelector = '[data-panel]',
      activeTabClass = null,
      activePanelClass = null,
      container = document
    } = options;

    const tabs = container.querySelectorAll(tabSelector);
    const panels = container.querySelectorAll(panelSelector);

    if (tabs.length === 0 || panels.length === 0) return;

    // Определяем активные классы автоматически, если не указаны
    const getActiveTabClass = () => {
      if (activeTabClass) return activeTabClass;
      const firstTab = tabs[0];
      const tabClasses = Array.from(firstTab.classList);
      const baseClass = tabClasses.find(cls => cls.includes('tab') && !cls.includes('--'));
      return baseClass ? baseClass + '--active' : '--active';
    };

    const getActivePanelClass = () => {
      if (activePanelClass) return activePanelClass;
      const firstPanel = panels[0];
      const panelClasses = Array.from(firstPanel.classList);
      const baseClass = panelClasses.find(cls => cls.includes('panel') && !cls.includes('--'));
      return baseClass ? baseClass + '--active' : '--active';
    };

    const tabActiveClass = getActiveTabClass();
    const panelActiveClass = getActivePanelClass();

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        if (!targetTab) return;

        // Убираем активный класс со всех табов
        tabs.forEach(t => t.classList.remove(tabActiveClass));
        // Добавляем активный класс к выбранному табу
        tab.classList.add(tabActiveClass);

        // Скрываем все панели
        panels.forEach(panel => panel.classList.remove(panelActiveClass));

        // Показываем выбранную панель
        const targetPanel = container.querySelector(`[data-panel="${targetTab}"]`);
        if (targetPanel) {
          targetPanel.classList.add(panelActiveClass);
        }
      });
    });
  }

  // Инициализация табов pricing
  initTabs({
    tabSelector: '.pricing__tab',
    panelSelector: '.pricing__panel',
    container: document.querySelector('.pricing') || document
  });

  // Инициализация табов certificates с управлением навигацией
  const certificatesContainer = document.querySelector('.certificates');
  if (certificatesContainer) {
    const certificatesTabs = certificatesContainer.querySelectorAll('.certificates__tab');
    const certificatesPanels = certificatesContainer.querySelectorAll('.certificates__panel');
    const certificatesNavs = certificatesContainer.querySelectorAll('.certificates__nav');

    // Функция для обновления видимости навигации
    const updateCertificatesNav = () => {
      const activePanel = certificatesContainer.querySelector('.certificates__panel--active');
      if (activePanel) {
        const activePanelName = activePanel.getAttribute('data-panel');
        certificatesNavs.forEach(nav => {
          const navName = nav.classList.contains('certificates__nav--tennis') ? 'tennis' : 
                         nav.classList.contains('certificates__nav--padel') ? 'padel' : null;
          if (navName === activePanelName) {
            nav.classList.add('certificates__nav--active');
          } else {
            nav.classList.remove('certificates__nav--active');
          }
        });
      }
    };

    // Инициализация табов
    initTabs({
      tabSelector: '.certificates__tab',
      panelSelector: '.certificates__panel',
      container: certificatesContainer
    });

    // Обновляем навигацию при переключении табов
    certificatesTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        setTimeout(updateCertificatesNav, 0); // Обновляем после переключения панели
      });
    });

    // Инициализируем навигацию при загрузке
    updateCertificatesNav();
  }

  // Анимация highlight-strip при скролле
  initScrollToCenterAnimation(
    document.querySelector('.highlight-strip'),
    'highlight-strip--visible'
  );

  // Анимация application__img при скролле
  initScrollToCenterAnimation(
    document.querySelector('.application__img'),
    'application__img--visible'
  );

  // Анимация карточек pricing при скролле (нижняя треть экрана)
  const pricingCards = document.querySelectorAll('.card-pricing[data-scroll-position]');
  pricingCards.forEach(card => {
    initScrollToCenterAnimation(
      card,
      'card-pricing--active'
    );
  });

  // Анимация изображений в certificate-gift при скролле
  const certificateGiftImages = document.querySelectorAll('.certificate-gift__image[data-scroll-position]');
  certificateGiftImages.forEach(image => {
    initScrollToCenterAnimation(
      image,
      'certificate-gift__image--active',
      { once: true }
    );
  });
});



