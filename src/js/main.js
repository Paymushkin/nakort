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

// Функция для ожидания загрузки Swiper
function waitForSwiper(callback, maxAttempts = 50, attempt = 0) {
  if (typeof Swiper !== 'undefined') {
    callback();
  } else if (attempt < maxAttempts) {
    setTimeout(() => waitForSwiper(callback, maxAttempts, attempt + 1), 100);
  } else {
    console.warn('Swiper не загрузился после ожидания');
  }
}

// Инициализация каруселей после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация hero карусели (не требует Swiper)
  if (typeof initHeroCarousel === 'function') {
    initHeroCarousel();
  }

  // Инициализация reviews карусели (требует Swiper)
  waitForSwiper(function() {
    if (typeof initReviewsCarousel === 'function') {
      initReviewsCarousel();
    }
  });

  // Инициализация certificates карусели (требует Swiper)
  waitForSwiper(function() {
    if (typeof initCertificatesCarousel === 'function') {
      initCertificatesCarousel();
    }
  });

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



