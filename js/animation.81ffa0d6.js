(function() {
  'use strict';

  const revealItems = document.querySelectorAll('[data-reveal]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function(item) { item.classList.add('is-visible'); });
  } else {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach(function(item) { observer.observe(item); });
  }

  const progress = document.getElementById('reading-progress');
  if (progress) {
    let scheduled = false;
    const updateProgress = function() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
      progress.style.width = value + '%';
      scheduled = false;
    };

    window.addEventListener('scroll', function() {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
  }
})();
