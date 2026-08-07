(function() {
  'use strict';

  const root = document.getElementById('site-search');
  const form = document.getElementById('site-search-form');
  const input = document.getElementById('site-search-input');
  const filters = document.getElementById('site-search-filters');
  const results = document.getElementById('site-search-results');
  const status = document.getElementById('site-search-status');
  const empty = document.getElementById('site-search-empty');
  const more = document.getElementById('site-search-more');
  if (!root || !form || !input || !filters || !results || !status || !empty || !more) return;

  let records = [];
  let activeType = '';
  let visibleLimit = 12;
  const pageSize = 12;

  function normalize(value) {
    return String(value || '').normalize('NFKC').toLocaleLowerCase('zh-CN').trim();
  }

  function searchableText(record) {
    return normalize([
      record.title,
      record.summary,
      record.content,
      record.subtype,
      ...(record.categories || []),
      ...(record.tags || [])
    ].join(' '));
  }

  function scoreRecord(record, query, tokens) {
    if (activeType && record.content_type !== activeType) return null;
    if (!tokens.length) return 0;

    const title = normalize(record.title);
    const summary = normalize(record.summary);
    const content = normalize(record.content);
    const subtype = normalize(record.subtype);
    const categories = (record.categories || []).map(normalize);
    const tags = (record.tags || []).map(normalize);
    const haystack = searchableText(record);
    if (!tokens.every((token) => haystack.includes(token))) return null;

    let score = 0;
    if (title === query) score += 320;
    else if (title.includes(query)) score += 160;
    if (summary.includes(query)) score += 36;
    if (content.includes(query)) score += 8;

    tokens.forEach(function(token) {
      if (title === token) score += 110;
      else if (title.includes(token)) score += 48;
      if (tags.includes(token)) score += 38;
      else if (tags.some((tag) => tag.includes(token))) score += 20;
      if (categories.includes(token)) score += 30;
      else if (categories.some((category) => category.includes(token))) score += 14;
      if (subtype.includes(token)) score += 12;
      if (summary.includes(token)) score += 8;
      if (content.includes(token)) score += 2;
    });
    return score;
  }

  function appendHighlightedText(element, value, tokens) {
    const text = String(value || '');
    const uniqueTokens = Array.from(new Set(tokens.filter(Boolean))).sort((a, b) => b.length - a.length);
    if (!uniqueTokens.length) {
      element.textContent = text;
      return;
    }

    const escaped = uniqueTokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const matcher = new RegExp(escaped.join('|'), 'gi');
    let cursor = 0;
    let match;
    while ((match = matcher.exec(text)) !== null) {
      if (match.index > cursor) element.append(document.createTextNode(text.slice(cursor, match.index)));
      const mark = document.createElement('mark');
      mark.textContent = match[0];
      element.append(mark);
      cursor = match.index + match[0].length;
      if (match[0].length === 0) matcher.lastIndex += 1;
    }
    if (cursor < text.length) element.append(document.createTextNode(text.slice(cursor)));
  }

  function createResult(match, highlightTokens) {
    const record = match.record;
    const article = document.createElement('article');
    article.className = 'site-search-result';
    article.dataset.contentType = record.content_type;
    article.dataset.score = String(match.score);

    const meta = document.createElement('div');
    meta.className = 'site-search-result-meta';
    const badge = document.createElement('span');
    badge.className = `content-type-badge content-type-${record.content_type}`;
    badge.textContent = record.content_type_label;
    meta.appendChild(badge);
    if (record.subtype) {
      const subtype = document.createElement('span');
      subtype.textContent = record.subtype;
      meta.appendChild(subtype);
    }
    if (record.date) {
      const date = document.createElement('time');
      date.textContent = record.date;
      meta.appendChild(date);
    }

    const heading = document.createElement('h2');
    const link = document.createElement('a');
    link.href = record.url;
    appendHighlightedText(link, record.title, highlightTokens);
    heading.appendChild(link);

    const description = document.createElement('p');
    appendHighlightedText(description, record.summary || record.content, highlightTokens);

    article.append(meta, heading, description);
    return article;
  }

  function updateUrl(query) {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (activeType) url.searchParams.set('type', activeType);
    else url.searchParams.delete('type');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function rankedMatches(query, tokens) {
    return records.map(function(record) {
      return { record, score: scoreRecord(record, query, tokens) };
    }).filter(function(match) {
      return match.score !== null;
    }).sort(function(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return String(b.record.date || '').localeCompare(String(a.record.date || ''));
    });
  }

  function render(resetLimit) {
    if (resetLimit) visibleLimit = pageSize;
    const rawQuery = input.value.trim();
    const query = normalize(rawQuery);
    const tokens = query.split(/\s+/).filter(Boolean);
    const highlightTokens = rawQuery.split(/\s+/).filter(Boolean);
    const matches = rankedMatches(query, tokens);
    const visible = matches.slice(0, visibleLimit);

    results.replaceChildren(...visible.map((match) => createResult(match, highlightTokens)));
    empty.hidden = matches.length !== 0;
    more.hidden = matches.length <= visible.length;
    more.textContent = matches.length > visible.length ? `显示更多（剩余 ${matches.length - visible.length} 条）` : '已显示全部结果';
    const progress = matches.length > visible.length ? `，当前显示 ${visible.length} 条` : '';
    status.textContent = query
      ? `找到 ${matches.length} 条与“${rawQuery}”相关的内容${progress}`
      : `共 ${matches.length} 条内容${progress}`;
    updateUrl(rawQuery);
  }

  function updateCounts() {
    filters.querySelectorAll('button[data-type]').forEach((button) => {
      const type = button.dataset.type;
      const count = type ? records.filter((record) => record.content_type === type).length : records.length;
      button.querySelector('span').textContent = count;
    });
  }

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    render(true);
  });
  form.addEventListener('reset', function() {
    window.requestAnimationFrame(function() { render(true); });
  });
  input.addEventListener('input', function() { render(true); });
  filters.addEventListener('click', function(event) {
    const button = event.target.closest('button[data-type]');
    if (!button) return;
    activeType = button.dataset.type;
    filters.querySelectorAll('button[data-type]').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    render(true);
  });
  more.addEventListener('click', function() {
    visibleLimit += pageSize;
    render(false);
  });
  document.addEventListener('keydown', function(event) {
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      event.preventDefault();
      input.focus();
    }
  });

  const params = new URLSearchParams(window.location.search);
  input.value = params.get('q') || '';
  const requestedType = params.get('type') || '';
  if (filters.querySelector(`button[data-type="${requestedType}"]`)) activeType = requestedType;

  fetch(root.dataset.indexUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      records = Array.isArray(data) ? data : [];
      updateCounts();
      const selected = filters.querySelector(`button[data-type="${activeType}"]`) || filters.querySelector('button[data-type=""]');
      selected.click();
    })
    .catch(() => {
      status.textContent = '搜索索引载入失败，请稍后刷新页面。';
      empty.hidden = false;
    });
})();
