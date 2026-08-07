(function() {
  'use strict';

  const grid = document.getElementById('bookmark-grid');
  const search = document.getElementById('bookmark-search');
  const kind = document.getElementById('bookmark-kind');
  const status = document.getElementById('bookmark-status');
  const count = document.getElementById('bookmark-visible-count');
  const empty = document.getElementById('bookmark-empty');

  if (!grid || !search || !kind || !status) return;
  const cards = Array.from(grid.querySelectorAll('.bookmark-card'));

  function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase('zh-CN');
  }

  function update() {
    const query = normalize(search.value);
    let visible = 0;
    cards.forEach(function(card) {
      const show = (!query || normalize(card.dataset.search).includes(query))
        && (!kind.value || card.dataset.kind === kind.value)
        && (!status.value || card.dataset.status === status.value);
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
  }

  search.addEventListener('input', update);
  kind.addEventListener('change', update);
  status.addEventListener('change', update);
})();
