(function() {
  'use strict';

  const button = document.getElementById('mobile-menu-button');
  const navigation = document.getElementById('site-navigation');
  const header = document.getElementById('main-header');

  function closeMenu() {
    if (!button || !navigation) return;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', '打开导航菜单');
    button.classList.remove('active');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }

  if (button && navigation) {
    button.addEventListener('click', function() {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      button.setAttribute('aria-label', isOpen ? '打开导航菜单' : '关闭导航菜单');
      button.classList.toggle('active', !isOpen);
      navigation.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    navigation.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeMenu();
        button.focus();
      }
    });

    window.matchMedia('(min-width: 769px)').addEventListener('change', function(event) {
      if (event.matches) closeMenu();
    });
  }

  function updateHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();
