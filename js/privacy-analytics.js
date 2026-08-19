(function() {
  'use strict';

  const body = document.body;
  if (!body || body.dataset.analyticsMode !== 'local-only') return;
  const storageKey = body.dataset.analyticsStorageKey || 'sido-private-views-v1';
  const privacyRequested = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';

  function emptyState() {
    return { version: 1, paths: {} };
  }

  function readState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
      return parsed && parsed.version === 1 && parsed.paths && typeof parsed.paths === 'object' ? parsed : emptyState();
    } catch (_) {
      return emptyState();
    }
  }

  function writeState(state) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
      return true;
    } catch (_) {
      return false;
    }
  }

  function updatePageCount(count) {
    document.querySelectorAll('[data-local-view-count]').forEach(function(element) {
      const value = element.querySelector('strong');
      if (value) value.textContent = String(count);
      element.hidden = false;
    });
  }

  function clear() {
    try { window.localStorage.removeItem(storageKey); } catch (_) { /* The in-memory empty state still applies. */ }
    window.dispatchEvent(new CustomEvent('sido:localviews', { detail: { state: emptyState(), privacyRequested } }));
  }

  const api = {
    storageKey,
    privacyRequested,
    read: readState,
    clear
  };
  window.SidoPrivateAnalytics = api;

  let state = readState();
  if (!privacyRequested && body.classList.contains('layout-post')) {
    const pathname = window.location.pathname;
    const sessionKey = `sido-local-view:${pathname}`;
    let alreadyCounted = false;
    try { alreadyCounted = window.sessionStorage.getItem(sessionKey) === '1'; } catch (_) { /* Count once if session storage is unavailable. */ }
    if (!alreadyCounted) {
      const previous = state.paths[pathname] || { count: 0, lastViewed: '' };
      state.paths[pathname] = { count: Number(previous.count || 0) + 1, lastViewed: new Date().toISOString() };
      writeState(state);
      try { window.sessionStorage.setItem(sessionKey, '1'); } catch (_) { /* No cross-page identifier is required. */ }
    }
    updatePageCount((state.paths[pathname] && state.paths[pathname].count) || 1);
  }

  window.dispatchEvent(new CustomEvent('sido:localviews', { detail: { state, privacyRequested } }));
})();
