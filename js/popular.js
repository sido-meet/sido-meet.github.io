(function() {
  'use strict';

  const root = document.getElementById('popular-content');
  const list = document.getElementById('popular-list');
  const status = document.getElementById('popular-status');
  const clearButton = document.getElementById('popular-clear');
  if (!root || !list || !status || !clearButton) return;

  let sourceItems = [];
  const typeLabels = { article: '人工写作', note: '过程笔记', ai: 'AI 专栏' };

  function privateState() {
    return window.SidoPrivateAnalytics ? window.SidoPrivateAnalytics.read() : { version: 1, paths: {} };
  }

  function itemPath(item) {
    return new URL(item.url, window.location.origin).pathname;
  }

  function recencyScore(date) {
    const ageDays = Math.max(0, (Date.now() - new Date(date).getTime()) / 86400000);
    return Math.max(0, 32 - ageDays / 30);
  }

  function rankedItems() {
    const state = privateState();
    return sourceItems.map(function(item) {
      const local = state.paths[itemPath(item)] || { count: 0 };
      const localCount = Number(local.count || 0);
      return {
        item,
        localCount,
        score: Number(item.editorial_score || 0) + Math.log1p(localCount) * 120 + recencyScore(item.date)
      };
    }).sort(function(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return String(b.item.date).localeCompare(String(a.item.date));
    });
  }

  function createItem(entry, index) {
    const item = entry.item;
    const li = document.createElement('li');
    li.className = 'popular-item';

    const rank = document.createElement('span');
    rank.className = 'popular-rank';
    rank.textContent = String(index + 1).padStart(2, '0');

    const copy = document.createElement('div');
    copy.className = 'popular-copy';
    const meta = document.createElement('div');
    meta.className = 'popular-meta';
    const type = document.createElement('span');
    type.textContent = typeLabels[item.content_type] || item.content_type;
    const date = document.createElement('time');
    date.textContent = item.date;
    meta.append(type, date);

    const heading = document.createElement('h2');
    const link = document.createElement('a');
    link.href = item.url;
    link.textContent = item.title;
    heading.appendChild(link);
    const description = document.createElement('p');
    description.textContent = item.summary;
    copy.append(meta, heading, description);

    const signal = document.createElement('span');
    signal.className = 'popular-signal';
    signal.textContent = entry.localCount > 0 ? `本机 ${entry.localCount} 次` : (item.featured ? '编辑精选' : '近期内容');
    li.append(rank, copy, signal);
    return li;
  }

  function render() {
    const ranked = rankedItems().slice(0, 10);
    const localTotal = ranked.reduce((sum, entry) => sum + entry.localCount, 0);
    list.replaceChildren(...ranked.map(createItem));
    if (window.SidoPrivateAnalytics && window.SidoPrivateAnalytics.privacyRequested) {
      status.textContent = '浏览器已启用隐私偏好，当前只展示编辑精选与近期内容。';
      clearButton.hidden = true;
    } else if (localTotal > 0) {
      status.textContent = '已按当前浏览器的本机阅读记录重新排序；数据没有上传。';
      clearButton.hidden = false;
    } else {
      status.textContent = '当前没有本机阅读记录，先展示编辑精选与近期内容。';
      clearButton.hidden = true;
    }
  }

  clearButton.addEventListener('click', function() {
    if (window.SidoPrivateAnalytics) window.SidoPrivateAnalytics.clear();
    render();
  });
  window.addEventListener('sido:localviews', render);

  fetch(root.dataset.indexUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      sourceItems = Array.isArray(data.items) ? data.items : [];
      render();
    })
    .catch(() => {
      status.textContent = '内容排行载入失败，请稍后刷新页面。';
    });
})();
