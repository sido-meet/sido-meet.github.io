(function() {
  'use strict';

  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const STATUS_VALUES = ['in_progress', 'todo', 'done', 'expired'];
  const VALID_STATUSES = new Set(STATUS_VALUES);
  const STATUS_LABELS = {
    in_progress: '进行中',
    todo: '待办',
    done: '已完成',
    expired: '超时'
  };
  const STATUS_COLOR_CLASSES = {
    in_progress: 'progress',
    todo: 'todo',
    done: 'done',
    expired: 'expired'
  };
  const STATUS_VISUAL_CLASSES = {
    in_progress: 'in-progress',
    todo: 'todo',
    done: 'done',
    expired: 'expired'
  };
  const STATUS_PRIORITY = {
    in_progress: 0,
    todo: 1,
    done: 2,
    expired: 3
  };
  const TAG_COLORS = ['dev', 'study', 'ops', 'rlhf', 'ai', 'life'];

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
  }

  function createSvg(name, size) {
    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    const appendShape = function(tagName, attributes) {
      const shape = document.createElementNS(SVG_NAMESPACE, tagName);
      Object.keys(attributes).forEach(function(attribute) {
        shape.setAttribute(attribute, attributes[attribute]);
      });
      svg.appendChild(shape);
    };

    if (name === 'chevron') {
      appendShape('polyline', { points: '6 9 12 15 18 9' });
    } else if (name === 'folder') {
      appendShape('path', { d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' });
    } else if (name === 'calendar') {
      appendShape('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' });
      appendShape('line', { x1: '16', y1: '2', x2: '16', y2: '6' });
      appendShape('line', { x1: '8', y1: '2', x2: '8', y2: '6' });
      appendShape('line', { x1: '3', y1: '10', x2: '21', y2: '10' });
    }

    return svg;
  }

  function normalizedStatus(value) {
    return VALID_STATUSES.has(value) ? value : 'todo';
  }

  function addStatusClasses(element, status) {
    const safeStatus = normalizedStatus(status);
    element.classList.add(safeStatus);
    const visualClass = STATUS_VISUAL_CLASSES[safeStatus];
    if (visualClass !== safeStatus) element.classList.add(visualClass);
  }

  function createEmptyState(className, iconSize, title, description) {
    const empty = createElement('div', className);
    empty.appendChild(createSvg('calendar', iconSize));
    if (title) empty.appendChild(createElement(description ? 'h3' : 'p', '', title));
    if (description) empty.appendChild(createElement('p', '', description));
    return empty;
  }

  function createCollapseButton(className, label, controlsId) {
    const button = createElement('button', className);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', controlsId);
    button.appendChild(createSvg('chevron', 14));
    return button;
  }

  function focusWithoutScroll(element) {
    if (!element || typeof element.focus !== 'function') return;
    try {
      element.focus({ preventScroll: true });
    } catch (_) {
      element.focus();
    }
  }

  const Schedule = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    plansData: [],
    currentCategory: 'all',
    currentView: 'timeline',
    categories: [],
    renderSequence: 0,
    dialogTrigger: null,
    previousBodyOverflow: '',

    init: function() {
      const today = this.formatDate(new Date());
      const plansDataElement = document.getElementById('plans-data');
      let sourcePlans = [];
      try {
        const parsedPlans = plansDataElement ? JSON.parse(plansDataElement.textContent) : [];
        sourcePlans = Array.isArray(parsedPlans) ? parsedPlans : [];
      } catch (error) {
        sourcePlans = [];
      }
      this.plansData = sourcePlans.map((plan) => this.normalizePlan(plan, today));
      this.extractCategories();
      this.bindEvents();
      this.renderCategoryTags();
      this.syncViewButtons();
      this.renderMiniCalendar();
      this.renderTodayPlans();
      this.updateStats();
      this.updateWeeklyProgress();
      this.updateCategoryCounts();
      this.renderTimeline();
    },

    normalizePlan: function(plan, today) {
      const source = plan && typeof plan === 'object' ? plan : {};
      const startDate = this.normalizeDateString(source.start_date);
      const endDate = this.normalizeDateString(source.end_date);
      let status = normalizedStatus(source.status);
      if (status !== 'done' && endDate && endDate < today) status = 'expired';

      return {
        title: String(source.title || ''),
        description: String(source.description || ''),
        category: String(source.category || '').trim() || '未分类',
        start_date: startDate,
        end_date: endDate,
        status
      };
    },

    normalizeDateString: function(value) {
      const normalized = value ? String(value).slice(0, 10) : '';
      return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : '';
    },

    parseLocalDate: function(value) {
      const parts = this.normalizeDateString(value).split('-').map(Number);
      if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
      return new Date(parts[0], parts[1] - 1, parts[2]);
    },

    isDateWithinPlan: function(dateString, plan) {
      const value = this.normalizeDateString(dateString);
      return Boolean(value && plan.start_date && plan.end_date && value >= plan.start_date && value <= plan.end_date);
    },

    extractCategories: function() {
      this.categories = Array.from(new Set(this.plansData.map((plan) => plan.category))).sort();
    },

    bindEvents: function() {
      const prevButton = document.querySelector('.prev-month');
      const nextButton = document.querySelector('.next-month');
      const closeButton = document.querySelector('.detail-close-btn');
      const overlay = document.getElementById('detail-overlay');

      if (prevButton) prevButton.addEventListener('click', () => this.changeMonth(-1));
      if (nextButton) nextButton.addEventListener('click', () => this.changeMonth(1));
      if (closeButton) closeButton.addEventListener('click', () => this.closeDetailPanel());
      if (overlay) overlay.addEventListener('click', () => this.closeDetailPanel());

      document.querySelectorAll('.view-btn').forEach((button) => {
        button.addEventListener('click', (event) => this.handleViewChange(event.currentTarget));
      });

      document.addEventListener('keydown', (event) => this.handleDialogKeydown(event));
    },

    renderCategoryTags: function() {
      const container = document.getElementById('category-tags');
      if (!container) return;

      const labels = {
        '开发': window.i18n_dev || '开发',
        '学习': window.i18n_study || '学习',
        '运营': window.i18n_ops || '运营'
      };
      const fragment = document.createDocumentFragment();
      const categories = ['all'].concat(this.categories);

      categories.forEach((category, index) => {
        const button = createElement('button', 'category-tag');
        const selected = category === this.currentCategory;
        button.type = 'button';
        button.dataset.category = category;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));

        const dot = createElement('span', 'tag-dot');
        dot.classList.add(category === 'all' ? 'all' : TAG_COLORS[(index - 1) % TAG_COLORS.length]);
        dot.setAttribute('aria-hidden', 'true');
        const label = createElement('span', 'tag-label', category === 'all' ? (window.i18n_all || '全部') : (labels[category] || category));
        const count = createElement('span', 'tag-count');
        count.dataset.countCategory = category;
        if (category === 'all') count.id = 'count-all';

        button.append(dot, label, count);
        button.addEventListener('click', (event) => this.handleCategoryClick(event.currentTarget));
        fragment.appendChild(button);
      });

      container.replaceChildren(fragment);
    },

    handleCategoryClick: function(button) {
      const requested = button.dataset.category || 'all';
      const category = requested === 'all' || this.categories.includes(requested) ? requested : 'all';
      this.currentCategory = category !== 'all' && category === this.currentCategory ? 'all' : category;
      this.syncCategoryButtons();
      this.filterPlans();
    },

    syncCategoryButtons: function() {
      document.querySelectorAll('.category-tag').forEach((button) => {
        const selected = button.dataset.category === this.currentCategory;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    },

    handleViewChange: function(button) {
      const view = button.dataset.view;
      if (view !== 'timeline' && view !== 'category') return;
      this.currentView = view;
      this.syncViewButtons();
      if (view === 'timeline') this.renderTimeline();
      else this.renderCategoryView();
    },

    syncViewButtons: function() {
      document.querySelectorAll('.view-btn').forEach((button) => {
        const selected = button.dataset.view === this.currentView;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    },

    getFilteredPlans: function() {
      if (this.currentCategory === 'all') return this.plansData.slice();
      return this.plansData.filter((plan) => plan.category === this.currentCategory);
    },

    filterPlans: function() {
      if (this.currentView === 'timeline') this.renderTimeline();
      else this.renderCategoryView();
      this.renderTodayPlans();
      this.updateStats();
      this.updateWeeklyProgress();
    },

    updateCategoryCounts: function() {
      const counts = new Map([['all', this.plansData.length]]);
      this.categories.forEach((category) => counts.set(category, 0));
      this.plansData.forEach((plan) => counts.set(plan.category, (counts.get(plan.category) || 0) + 1));

      document.querySelectorAll('.category-tag').forEach((button) => {
        const count = button.querySelector('.tag-count');
        if (count) count.textContent = `(${counts.get(button.dataset.category) || 0})`;
      });
    },

    updateStats: function() {
      const filteredPlans = this.getFilteredPlans();
      const counts = {
        in_progress: filteredPlans.filter((plan) => plan.status === 'in_progress').length,
        todo: filteredPlans.filter((plan) => plan.status === 'todo').length,
        done: filteredPlans.filter((plan) => plan.status === 'done').length,
        expired: filteredPlans.filter((plan) => plan.status === 'expired').length
      };
      const targets = {
        in_progress: document.getElementById('stat-in-progress'),
        todo: document.getElementById('stat-todo'),
        done: document.getElementById('stat-done'),
        expired: document.getElementById('stat-expired')
      };
      STATUS_VALUES.forEach((status) => {
        if (targets[status]) targets[status].textContent = String(counts[status]);
      });
    },

    renderStats: function() {
      this.updateStats();
    },

    updateWeeklyProgress: function() {
      const filteredPlans = this.getFilteredPlans();
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');
      if (!progressFill || !progressText) return;

      const total = filteredPlans.length;
      const done = filteredPlans.filter((plan) => plan.status === 'done').length;
      const percentage = total > 0 ? (done / total) * 100 : 0;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${done}/${total}`;
    },

    renderWeeklyProgress: function() {
      this.updateWeeklyProgress();
    },

    renderTodayPlans: function() {
      const container = document.getElementById('today-plans');
      if (!container) return;

      const today = this.formatDate(new Date());
      const plans = this.getFilteredPlans().filter((plan) => this.isDateWithinPlan(today, plan));
      if (!plans.length) {
        container.replaceChildren(createEmptyState('empty-today', 32, window.i18n_todo || '暂无计划'));
        return;
      }

      const fragment = document.createDocumentFragment();
      plans.forEach((plan) => {
        const card = createElement('div', 'today-plan-card');
        addStatusClasses(card, plan.status);
        const title = createElement('h4', 'today-plan-title', plan.title);
        const description = createElement('p', 'today-plan-description', plan.description);
        const meta = createElement('div', 'today-plan-meta');
        meta.appendChild(createElement('span', 'today-plan-category', plan.category));
        card.append(title, description, meta);
        fragment.appendChild(card);
      });
      container.replaceChildren(fragment);
    },

    updateTodayPlans: function() {
      this.renderTodayPlans();
    },

    nextRenderPrefix: function(view) {
      this.renderSequence += 1;
      return `schedule-${view}-${this.renderSequence}`;
    },

    renderTimeline: function() {
      const container = document.getElementById('timeline-container');
      if (!container) return;
      const plans = this.getFilteredPlans();

      if (!plans.length) {
        container.replaceChildren(createEmptyState('empty-timeline', 48, '暂无计划', '没有找到符合条件的计划'));
        return;
      }

      const groupedByMonth = new Map();
      plans.slice().sort((a, b) => a.start_date.localeCompare(b.start_date)).forEach((plan) => {
        const month = /^\d{4}-\d{2}/.test(plan.start_date) ? plan.start_date.slice(0, 7) : 'undated';
        if (!groupedByMonth.has(month)) groupedByMonth.set(month, []);
        groupedByMonth.get(month).push(plan);
      });

      const prefix = this.nextRenderPrefix('timeline');
      const fragment = document.createDocumentFragment();
      Array.from(groupedByMonth.entries()).forEach(([month, monthPlans], monthIndex) => {
        fragment.appendChild(this.createMonthSection(month, monthPlans, `${prefix}-month-${monthIndex}`));
      });
      container.replaceChildren(fragment);
    },

    createMonthSection: function(month, plans, idPrefix) {
      const section = createElement('div', 'timeline-month collapsed');
      section.dataset.month = month;

      const header = createElement('div', 'timeline-month-header');
      const items = createElement('div', 'timeline-items');
      items.id = `${idPrefix}-items`;
      items.hidden = true;
      const monthLabel = month === 'undated'
        ? '日期待定'
        : `${month.slice(0, 4)} 年 ${Number(month.slice(5, 7))} 月`;
      const toggle = createCollapseButton('month-collapse-btn', `展开${monthLabel}`, items.id);
      const dot = createElement('span', 'timeline-dot');
      dot.setAttribute('aria-hidden', 'true');
      const title = createElement('h3', 'timeline-month-title', monthLabel);
      const count = createElement('span', 'month-item-count', `${plans.length} 项`);
      header.append(toggle, dot, title, count);

      STATUS_VALUES.forEach((status, statusIndex) => {
        const statusPlans = plans.filter((plan) => plan.status === status);
        if (statusPlans.length) {
          items.appendChild(this.createStatusGroup(status, statusPlans, `${idPrefix}-status-${statusIndex}`, true));
        }
      });

      const setExpanded = (expanded) => {
        section.classList.toggle('collapsed', !expanded);
        items.hidden = !expanded;
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.setAttribute('aria-label', `${expanded ? '折叠' : '展开'}${monthLabel}`);
      };
      toggle.addEventListener('click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
      header.addEventListener('click', (event) => {
        if (!toggle.contains(event.target)) toggle.click();
      });

      section.append(header, items);
      return section;
    },

    createStatusGroup: function(status, plans, idPrefix, includeCategory) {
      const safeStatus = normalizedStatus(status);
      const group = createElement('div', 'status-group');
      group.dataset.status = safeStatus;
      const items = createElement('div', 'status-group-items');
      items.id = `${idPrefix}-items`;
      items.style.display = 'contents';
      items.setAttribute('role', 'group');
      items.setAttribute('aria-label', `${STATUS_LABELS[safeStatus]}计划`);

      const header = createElement('button', 'status-group-header');
      header.type = 'button';
      header.style.border = '0';
      header.style.background = 'transparent';
      header.style.color = 'inherit';
      header.style.font = 'inherit';
      header.style.textAlign = 'left';
      header.style.width = '100%';
      header.setAttribute('aria-expanded', 'true');
      header.setAttribute('aria-label', `折叠${STATUS_LABELS[safeStatus]}计划`);

      const dot = createElement('span', 'status-group-dot');
      dot.classList.add(STATUS_COLOR_CLASSES[safeStatus]);
      dot.setAttribute('aria-hidden', 'true');
      header.append(
        dot,
        createElement('span', 'status-group-title', STATUS_LABELS[safeStatus]),
        createElement('span', 'status-group-count', String(plans.length))
      );

      plans.forEach((plan, index) => {
        const item = this.createTimelineItem(plan, `${idPrefix}-item-${index}`, includeCategory);
        items.appendChild(item);
      });
      header.setAttribute('aria-controls', items.id);
      group.append(header, items);

      header.addEventListener('click', () => {
        const expanded = header.getAttribute('aria-expanded') !== 'true';
        group.classList.toggle('collapsed', !expanded);
        header.setAttribute('aria-expanded', String(expanded));
        header.setAttribute('aria-label', `${expanded ? '折叠' : '展开'}${STATUS_LABELS[safeStatus]}计划`);
        items.setAttribute('aria-hidden', String(!expanded));
        Array.from(items.querySelectorAll('.timeline-item')).forEach((item) => {
          item.hidden = !expanded;
        });
      });

      return group;
    },

    createTimelineItem: function(plan, id, includeCategory) {
      const item = createElement('div', 'timeline-item');
      item.id = id;
      item.dataset.status = plan.status;
      item.dataset.category = plan.category;
      item.dataset.startDate = plan.start_date;
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `查看计划：${plan.title}，${plan.start_date || '日期待定'}`);

      const marker = createElement('div', 'timeline-item-marker');
      const markerDot = createElement('span', 'timeline-item-dot');
      addStatusClasses(markerDot, plan.status);
      markerDot.setAttribute('aria-hidden', 'true');
      marker.appendChild(markerDot);

      const content = createElement('div', 'timeline-item-content');
      const itemHeader = createElement('div', 'timeline-item-header');
      itemHeader.appendChild(createElement('h4', 'timeline-item-title', plan.title));
      const description = createElement('p', 'timeline-item-description', plan.description);
      const meta = createElement('div', 'timeline-item-meta');

      if (includeCategory) {
        const category = createElement('span', 'timeline-item-category');
        category.append(createSvg('folder', 12), document.createTextNode(plan.category));
        meta.appendChild(category);
      }
      const dates = createElement('span', 'timeline-item-dates');
      dates.append(createSvg('calendar', 12), document.createTextNode(`${plan.start_date || '日期待定'} ~ ${plan.end_date || '日期待定'}`));
      meta.appendChild(dates);
      content.append(itemHeader, description, meta);
      item.append(marker, content);

      const activate = () => {
        const matchingPlans = this.getFilteredPlans().filter((candidate) => (
          candidate.category === plan.category && candidate.start_date === plan.start_date
        ));
        this.openDetailPanel(plan.start_date, matchingPlans.length ? matchingPlans : [plan], item);
      };
      item.addEventListener('click', activate);
      item.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activate();
      });

      return item;
    },

    renderCategoryView: function() {
      const container = document.getElementById('timeline-container');
      if (!container) return;
      const plans = this.getFilteredPlans();
      const view = createElement('div', 'category-view');
      view.id = 'category-view';

      if (!plans.length) {
        view.appendChild(createEmptyState('empty-timeline', 48, '暂无计划', '没有找到符合条件的计划'));
        container.replaceChildren(view);
        return;
      }

      const prefix = this.nextRenderPrefix('category');
      this.categories.forEach((category, index) => {
        const categoryPlans = plans.filter((plan) => plan.category === category);
        if (categoryPlans.length) {
          view.appendChild(this.createCategorySection(category, categoryPlans, `${prefix}-section-${index}`, TAG_COLORS[index % TAG_COLORS.length]));
        }
      });
      container.replaceChildren(view);
    },

    createCategorySection: function(category, plans, idPrefix, colorClass) {
      const section = createElement('div', 'category-section collapsed');
      section.dataset.category = category;
      const header = createElement('div', 'category-section-header');
      const items = createElement('div', 'category-items');
      items.id = `${idPrefix}-items`;
      items.hidden = true;
      const toggle = createCollapseButton('category-collapse-btn', `展开${category}`, items.id);
      const dot = createElement('span', 'category-dot');
      dot.classList.add(colorClass);
      dot.setAttribute('aria-hidden', 'true');
      header.append(
        toggle,
        dot,
        createElement('h3', 'category-section-title', category),
        createElement('span', 'category-count', `${plans.length} 项`)
      );

      STATUS_VALUES.forEach((status, statusIndex) => {
        const statusPlans = plans
          .filter((plan) => plan.status === status)
          .sort((a, b) => a.start_date.localeCompare(b.start_date));
        if (statusPlans.length) {
          items.appendChild(this.createStatusGroup(status, statusPlans, `${idPrefix}-status-${statusIndex}`, false));
        }
      });

      const setExpanded = (expanded) => {
        section.classList.toggle('collapsed', !expanded);
        items.hidden = !expanded;
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.setAttribute('aria-label', `${expanded ? '折叠' : '展开'}${category}`);
      };
      toggle.addEventListener('click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
      header.addEventListener('click', (event) => {
        if (!toggle.contains(event.target)) toggle.click();
      });

      section.append(header, items);
      return section;
    },

    getMonthData: function(year, month) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      return {
        startDay: firstDay.getDay(),
        daysInMonth: lastDay.getDate(),
        today: new Date()
      };
    },

    getPlansForDate: function(date) {
      const dateString = this.formatDate(date);
      return this.plansData.filter((plan) => this.isDateWithinPlan(dateString, plan));
    },

    getTodayPlans: function() {
      return this.getPlansForDate(new Date());
    },

    formatDate: function(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    getStatusPriority: function(status) {
      return STATUS_PRIORITY[normalizedStatus(status)];
    },

    renderMiniCalendar: function() {
      const grid = document.getElementById('mini-calendar-grid');
      const monthTitle = document.getElementById('mini-month-title');
      if (!grid || !monthTitle) return;

      monthTitle.textContent = `${this.currentYear} 年 ${this.currentMonth + 1} 月`;
      const data = this.getMonthData(this.currentYear, this.currentMonth);
      const totalCells = Math.ceil((data.startDay + data.daysInMonth) / 7) * 7;
      const fragment = document.createDocumentFragment();

      for (let index = 0; index < totalCells; index += 1) {
        const dayNumber = index - data.startDay + 1;
        const inCurrentMonth = dayNumber >= 1 && dayNumber <= data.daysInMonth;
        if (!inCurrentMonth) {
          const blank = createElement('div', 'mini-day other-month');
          blank.setAttribute('aria-hidden', 'true');
          fragment.appendChild(blank);
          continue;
        }

        const date = new Date(this.currentYear, this.currentMonth, dayNumber);
        const dateString = this.formatDate(date);
        const plans = this.getPlansForDate(date);
        const today = this.isSameDay(date, data.today);
        const day = createElement('div', 'mini-day', String(dayNumber));
        day.dataset.date = dateString;
        day.tabIndex = 0;
        day.setAttribute('role', 'button');
        day.setAttribute('aria-label', `${this.currentYear}年${this.currentMonth + 1}月${dayNumber}日${today ? '，今天' : ''}${plans.length ? `，${plans.length} 项计划` : '，无计划'}`);
        if (today) {
          day.classList.add('today');
          day.setAttribute('aria-current', 'date');
        }
        if (plans.length) day.classList.add('has-events');
        day.addEventListener('click', () => this.handleDayClick(day));
        day.addEventListener('keydown', (event) => this.handleCalendarKeydown(event, day));
        fragment.appendChild(day);
      }

      grid.replaceChildren(fragment);
    },

    handleCalendarKeydown: function(event, day) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.handleDayClick(day);
        return;
      }

      const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!Object.prototype.hasOwnProperty.call(offsets, event.key)) return;
      const days = Array.from(document.querySelectorAll('#mini-calendar-grid .mini-day[role="button"]'));
      const currentIndex = days.indexOf(day);
      const nextIndex = currentIndex + offsets[event.key];
      if (nextIndex < 0 || nextIndex >= days.length) return;
      event.preventDefault();
      days[nextIndex].focus();
    },

    isSameDay: function(first, second) {
      return first.getFullYear() === second.getFullYear()
        && first.getMonth() === second.getMonth()
        && first.getDate() === second.getDate();
    },

    handleDayClick: function(day) {
      const dateString = day.dataset.date;
      const plans = this.plansData
        .filter((plan) => this.isDateWithinPlan(dateString, plan))
        .sort((a, b) => this.getStatusPriority(a.status) - this.getStatusPriority(b.status));
      if (plans.length) this.openDetailPanel(dateString, plans, day);
    },

    openDetailPanel: function(dateString, plans, trigger) {
      const panel = document.getElementById('detail-panel');
      const overlay = document.getElementById('detail-overlay');
      const dateElement = document.getElementById('detail-date');
      const content = document.getElementById('detail-panel-content');
      if (!panel || !overlay || !dateElement || !content) return;

      const date = this.parseLocalDate(dateString);
      dateElement.textContent = date
        ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
        : (dateString || '日期待定');

      const fragment = document.createDocumentFragment();
      plans.map((plan) => this.normalizePlan(plan, this.formatDate(new Date()))).forEach((plan) => {
        const item = createElement('div', 'detail-plan-item');
        addStatusClasses(item, plan.status);
        const title = createElement('h4', 'detail-plan-title', plan.title);
        const description = createElement('p', 'detail-plan-description', plan.description);
        const meta = createElement('div', 'detail-plan-meta');
        const status = createElement('span', 'detail-status-badge', STATUS_LABELS[plan.status]);
        addStatusClasses(status, plan.status);
        meta.append(
          status,
          createElement('span', 'detail-plan-category', plan.category),
          createElement('span', 'detail-plan-dates', `${plan.start_date || '日期待定'} ~ ${plan.end_date || '日期待定'}`)
        );
        item.append(title, description, meta);
        fragment.appendChild(item);
      });
      content.replaceChildren(fragment);

      this.dialogTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement;
      this.previousBodyOverflow = document.body.style.overflow;
      panel.removeAttribute('inert');
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';

      const closeButton = panel.querySelector('.detail-close-btn');
      window.requestAnimationFrame(() => focusWithoutScroll(closeButton || panel));
    },

    handleDialogKeydown: function(event) {
      const panel = document.getElementById('detail-panel');
      if (!panel || !panel.classList.contains('open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeDetailPanel();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter((element) => element.getAttribute('aria-hidden') !== 'true' && element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    },

    closeDetailPanel: function() {
      const panel = document.getElementById('detail-panel');
      const overlay = document.getElementById('detail-overlay');
      if (!panel || !panel.classList.contains('open')) return;

      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = this.previousBodyOverflow;

      const trigger = this.dialogTrigger;
      this.dialogTrigger = null;
      if (trigger && trigger.isConnected) focusWithoutScroll(trigger);
    },

    changeMonth: function(delta) {
      this.currentMonth += delta;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear += 1;
      } else if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear -= 1;
      }
      this.renderMiniCalendar();
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.schedule-page')) Schedule.init();
  });

  window.Schedule = Schedule;
})();
