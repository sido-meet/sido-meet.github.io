(function() {
  'use strict';

  const button = document.getElementById('mobile-menu-button');
  const navigation = document.getElementById('site-navigation');
  const header = document.getElementById('main-header');
  const desktopQuery = window.matchMedia('(min-width: 1024px)');

  function isMenuOpen() {
    return button && button.getAttribute('aria-expanded') === 'true';
  }

  function getMenuFocusables() {
    if (!button || !navigation) return [];

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'summary',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const navigationItems = Array.prototype.filter.call(
      navigation.querySelectorAll(selector),
      function(element) {
        return element.getAttribute('aria-hidden') !== 'true' &&
          !element.hasAttribute('hidden') &&
          element.getClientRects().length > 0;
      }
    );

    return [button].concat(navigationItems.filter(function(element) {
      return element !== button;
    }));
  }

  function closeMenu() {
    if (!button || !navigation) return;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', '打开导航菜单');
    button.classList.remove('active');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');

    navigation.querySelectorAll('details[open]').forEach(function(details) {
      details.removeAttribute('open');
    });
  }

  function openMenu() {
    if (!button || !navigation) return;
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', '关闭导航菜单');
    button.classList.add('active');
    navigation.classList.add('is-open');
    document.body.classList.add('menu-open');

    window.requestAnimationFrame(function() {
      if (!isMenuOpen()) return;
      const firstNavigationItem = getMenuFocusables().find(function(element) {
        return element !== button;
      });
      if (firstNavigationItem) firstNavigationItem.focus();
    });
  }

  if (button && navigation) {
    button.addEventListener('click', function() {
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navigation.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function(event) {
      if (!isMenuOpen()) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        button.focus();
        return;
      }

      if (event.key === 'Tab') {
        const focusables = getMenuFocusables();
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeIndex = focusables.indexOf(document.activeElement);

        if (activeIndex === -1) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    const handleDesktopChange = function(event) {
      if (event.matches) closeMenu();
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', handleDesktopChange);
    } else {
      desktopQuery.addListener(handleDesktopChange);
    }
  }

  function updateHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();
