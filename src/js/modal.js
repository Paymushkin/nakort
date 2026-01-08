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

