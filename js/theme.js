(function() {
  'use strict';

  const storageKey = 'sido-color-theme';
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    try {
      const value = window.localStorage.getItem(storageKey);
      return value === 'light' || value === 'dark' ? value : '';
    } catch (_) {
      return '';
    }
  }

  function syncGiscus(theme) {
    const frame = document.querySelector('iframe.giscus-frame');
    if (!frame || !frame.contentWindow) return false;
    frame.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
    return true;
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const dark = theme === 'dark';
    const label = dark ? '切换到浅色模式' : '切换到深色模式';
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.content = dark ? '#0c1410' : '#16261f';
    if (toggle) {
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
      toggle.setAttribute('aria-pressed', String(dark));
    }
    if (persist) {
      try { window.localStorage.setItem(storageKey, theme); } catch (_) { /* The visual mode still works. */ }
    }
    syncGiscus(theme);
    window.dispatchEvent(new CustomEvent('sido:themechange', { detail: { theme } }));
  }

  const initialTheme = root.dataset.theme === 'dark' ? 'dark' : 'light';
  applyTheme(initialTheme, false);

  if (toggle) {
    toggle.addEventListener('click', function() {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  }

  const handleSystemChange = function(event) {
    if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light', false);
  };
  if (typeof systemTheme.addEventListener === 'function') systemTheme.addEventListener('change', handleSystemChange);
  else if (typeof systemTheme.addListener === 'function') systemTheme.addListener(handleSystemChange);

  if ('MutationObserver' in window && document.body) {
    const observer = new MutationObserver(function() {
      if (syncGiscus(root.dataset.theme || 'light')) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
