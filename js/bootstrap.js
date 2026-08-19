(function () {
  'use strict';

  document.documentElement.classList.add('js');

  try {
    var storageKey = 'sido-color-theme';
    var savedTheme = localStorage.getItem(storageKey);
    var theme = savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
  }
}());
