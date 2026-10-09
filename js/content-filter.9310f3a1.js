(function() {
  'use strict';

  const list = document.getElementById('content-index');
  const input = document.getElementById('content-search');
  const filter = document.getElementById('content-filter');
  const sortButton = document.getElementById('content-sort');
  const count = document.getElementById('content-visible-count');
  const empty = document.getElementById('content-empty');
  const reset = document.getElementById('content-reset');

  if (!list || !input || !sortButton) return;

  const items = Array.from(list.querySelectorAll('.article-index-item'));

  function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase('zh-CN');
  }

  function update() {
    const query = normalize(input.value);
    const selected = normalize(filter && filter.value);
    let visible = 0;

    items.forEach(function(item) {
      const matchesQuery = !query || normalize(item.dataset.search).includes(query);
      const values = normalize(item.dataset.filter).split('|').filter(Boolean);
      const matchesFilter = !selected || values.includes(selected);
      const shouldShow = matchesQuery && matchesFilter;
      item.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });

    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
  }

  function sortItems() {
    const nextOrder = sortButton.dataset.order === 'desc' ? 'asc' : 'desc';
    sortButton.dataset.order = nextOrder;
    sortButton.textContent = nextOrder === 'desc' ? '最新优先 ↓' : '最早优先 ↑';
    items
      .slice()
      .sort(function(a, b) {
        const result = Number(a.dataset.date) - Number(b.dataset.date);
        return nextOrder === 'asc' ? result : -result;
      })
      .forEach(function(item) { list.appendChild(item); });
  }

  input.addEventListener('input', update);
  if (filter) filter.addEventListener('change', update);
  sortButton.addEventListener('click', sortItems);

  if (reset) {
    reset.addEventListener('click', function() {
      input.value = '';
      if (filter) filter.value = '';
      update();
      input.focus();
    });
  }
})();
