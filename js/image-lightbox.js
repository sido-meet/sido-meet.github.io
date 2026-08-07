(function() {
  'use strict';

  const images = Array.from(document.querySelectorAll('.post-content img, .post-cover img')).filter(function(image) {
    return !image.closest('a') && !image.hasAttribute('data-no-lightbox');
  });
  if (!images.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'image-lightbox';
  dialog.setAttribute('aria-label', '图片预览');
  dialog.innerHTML = [
    '<button class="image-lightbox-close" type="button" aria-label="关闭图片预览">×</button>',
    '<figure>',
    '<img alt="">',
    '<figcaption></figcaption>',
    '</figure>'
  ].join('');
  document.body.appendChild(dialog);

  const preview = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  const close = dialog.querySelector('.image-lightbox-close');
  let trigger = null;

  function imageCaption(image) {
    const figureCaption = image.closest('figure')?.querySelector('figcaption');
    return (figureCaption && figureCaption.textContent.trim()) || image.alt || '';
  }

  function open(image) {
    trigger = image;
    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt || '';
    const text = imageCaption(image);
    caption.textContent = text;
    caption.hidden = !text;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      close.focus();
    } else {
      window.open(preview.src, '_blank', 'noopener,noreferrer');
    }
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  images.forEach(function(image) {
    if (!image.closest('.post-cover') && !image.hasAttribute('loading')) image.loading = 'lazy';
    image.decoding = 'async';
    image.classList.add('is-zoomable');
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', image.alt ? `查看大图：${image.alt}` : '查看大图');
    image.addEventListener('click', function() { open(image); });
    image.addEventListener('keydown', function(event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open(image);
    });
  });

  close.addEventListener('click', closeDialog);
  dialog.addEventListener('click', function(event) {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('close', function() {
    preview.removeAttribute('src');
    if (trigger) trigger.focus({ preventScroll: true });
  });
})();
