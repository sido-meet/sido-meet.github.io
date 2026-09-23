(function() {
  'use strict';

  function initToc() {
    const toc = document.querySelector('.post-toc');
    if (!toc) return;

    const details = toc.querySelector('details');
    const links = Array.from(toc.querySelectorAll('.post-toc-nav a[href^="#"]'));
    const entries = links.map(function(link) {
      let id = link.hash.slice(1);
      try { id = decodeURIComponent(id); } catch (_) { /* Keep the original hash. */ }
      return { link, heading: document.getElementById(id) };
    }).filter(function(entry) { return entry.heading; });

    const desktop = window.matchMedia('(min-width: 1100px)');
    let previousDesktop;
    const syncDetails = function() {
      if (!details || desktop.matches === previousDesktop) return;
      details.open = desktop.matches;
      previousDesktop = desktop.matches;
    };
    syncDetails();
    if (typeof desktop.addEventListener === 'function') desktop.addEventListener('change', syncDetails);
    else if (typeof desktop.addListener === 'function') desktop.addListener(syncDetails);

    if (!entries.length) return;
    let scheduled = false;
    const setActive = function(activeHeading) {
      entries.forEach(function(entry) {
        const active = entry.heading === activeHeading;
        entry.link.classList.toggle('is-active', active);
        if (active) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      });
    };
    const updateActive = function() {
      const offset = 128;
      let activeHeading = entries[0].heading;
      entries.forEach(function(entry) {
        if (entry.heading.getBoundingClientRect().top <= offset) activeHeading = entry.heading;
      });
      setActive(activeHeading);
      scheduled = false;
    };
    const scheduleUpdate = function() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(updateActive);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    links.forEach(function(link) {
      link.addEventListener('click', function() {
        if (!desktop.matches && details) details.open = false;
      });
    });
    updateActive();
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value);

    return new Promise(function(resolve, reject) {
      const input = document.createElement('textarea');
      input.value = value;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try {
        if (!document.execCommand('copy')) throw new Error('copy command failed');
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        input.remove();
      }
    });
  }

  function initShare() {
    const section = document.querySelector('.post-share');
    if (!section) return;

    const nativeButton = section.querySelector('[data-share-action="native"]');
    const copyButton = section.querySelector('[data-share-action="copy"]');
    const status = section.querySelector('.post-share-status');
    const shareData = {
      title: section.dataset.shareTitle || document.title,
      text: document.querySelector('meta[name="description"]')?.content || '',
      url: section.dataset.shareUrl || window.location.href
    };
    let statusTimer;

    const announce = function(message) {
      window.clearTimeout(statusTimer);
      status.textContent = message;
      statusTimer = window.setTimeout(function() { status.textContent = ''; }, 4000);
    };

    if (nativeButton && typeof navigator.share === 'function') {
      nativeButton.hidden = false;
      nativeButton.addEventListener('click', function() {
        navigator.share(shareData)
          .then(function() { announce('分享面板已打开'); })
          .catch(function(error) {
            if (error && error.name !== 'AbortError') announce('暂时无法分享，请复制链接');
          });
      });
    }

    if (copyButton) {
      copyButton.addEventListener('click', function() {
        copyText(shareData.url)
          .then(function() {
            copyButton.textContent = '已复制';
            announce('文章链接已复制');
            window.setTimeout(function() { copyButton.textContent = '复制链接'; }, 1800);
          })
          .catch(function() { announce('复制失败，请从地址栏复制'); });
      });
    }
  }

  initToc();
  initShare();
})();
