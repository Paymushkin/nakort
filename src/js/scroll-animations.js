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
