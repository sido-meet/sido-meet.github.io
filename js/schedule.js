(function() {
  'use strict';

  const Schedule = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    plansData: [],
    currentCategory: 'all',
    currentView: 'timeline',
    activeFilters: [],
    categories: [],

    init: function() {
      if (typeof window.PLANS_DATA !== 'undefined') {
        const today = this.formatDate(new Date());
        this.plansData = window.PLANS_DATA.map(plan => {
          const startDate = this.normalizeDateString(plan.start_date);
          const endDate = this.normalizeDateString(plan.end_date);
          return {
            ...plan,
            start_date: startDate,
            end_date: endDate,
            status: plan.status !== 'done' && endDate < today ? 'expired' : plan.status
          };
        });
      }
      this.extractCategories();
      this.activeFilters = this.categories.slice();
      this.bindEvents();
      this.renderCategoryTags();
      this.renderMiniCalendar();
      this.renderTodayPlans();
      this.renderStats();
      this.renderWeeklyProgress();
      this.updateCategoryCounts();
      this.renderTimeline();
    },

    normalizeDateString: function(value) {
      if (!value) return '';
      return String(value).slice(0, 10);
    },

    parseLocalDate: function(value) {
      const parts = this.normalizeDateString(value).split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    },

    isDateWithinPlan: function(dateString, plan) {
      const value = this.normalizeDateString(dateString);
      return value >= plan.start_date && value <= plan.end_date;
    },

    extractCategories: function() {
      const categorySet = new Set();
      this.plansData.forEach(plan => {
        if (plan.category) {
          categorySet.add(plan.category);
        }
      });
      this.categories = Array.from(categorySet).sort();
    },

    renderCategoryTags: function() {
      const container = document.getElementById('category-tags');
      if (!container) return;

      const categoryLabels = {
        '开发': window.i18n_dev || '开发',
        '学习': window.i18n_study || '学习',
        '运营': window.i18n_ops || '运营'
      };

      let html = `
        <button class="category-tag active" data-category="all">
          <span class="tag-dot all"></span>
          <span>${window.i18n_all || '全部'}</span>
          <span class="tag-count" id="count-all"></span>
        </button>
      `;

      const tagColors = ['dev', 'study', 'ops', 'rlhf', 'ai', 'life'];
      this.categories.forEach((cat, index) => {
        const colorClass = tagColors[index % tagColors.length];
        const label = categoryLabels[cat] || cat;
        html += `
          <button class="category-tag" data-category="${cat}">
            <span class="tag-dot ${colorClass}"></span>
            <span>${label}</span>
            <span class="tag-count" id="count-${cat}"></span>
          </button>
        `;
      });

      container.innerHTML = html;

      document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', (e) => this.handleCategoryClick(e.currentTarget));
      });
    },

    bindEvents: function() {
      const prevBtn = document.querySelector('.prev-month');
      const nextBtn = document.querySelector('.next-month');
      const closeBtn = document.querySelector('.detail-close-btn');
      const overlay = document.querySelector('.detail-overlay');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.changeMonth(-1));
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.changeMonth(1));
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeDetailPanel());
      }

      if (overlay) {
        overlay.addEventListener('click', () => this.closeDetailPanel());
      }

      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.handleViewChange(e.currentTarget));
      });
    },

    handleCategoryClick: function(tag) {
      const category = tag.dataset.category;

      if (category === 'all') {
        this.currentCategory = 'all';
        document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      } else {
        const clickedTag = tag;
        const allTag = document.querySelector('.category-tag[data-category="all"]');
        if (allTag) allTag.classList.remove('active');

        const wasActive = clickedTag.classList.contains('active');

        document.querySelectorAll('.category-tag').forEach(t => {
          if (t.dataset.category !== 'all') {
            t.classList.remove('active');
          }
        });

        if (!wasActive) {
          clickedTag.classList.add('active');
          this.currentCategory = category;
        } else {
          this.currentCategory = 'all';
          if (allTag) allTag.classList.add('active');
        }
      }

      this.filterPlans();
    },

    handleViewChange: function(btn) {
      const view = btn.dataset.view;
      this.currentView = view;

      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (view === 'timeline') {
        this.renderTimeline();
      } else {
        this.renderCategoryView();
      }
    },

    getFilteredPlans: function() {
      let plans = this.plansData;

      if (this.currentCategory !== 'all') {
        plans = plans.filter(p => p.category === this.currentCategory);
      }

      return plans;
    },

    filterPlans: function() {
      if (this.currentView === 'timeline') {
        this.renderTimeline();
      } else {
        this.renderCategoryView();
      }
      this.updateTodayPlans();
      this.updateStats();
      this.updateWeeklyProgress();
    },

    updateCategoryCounts: function() {
      const counts = { all: this.plansData.length };
      this.categories.forEach(cat => counts[cat] = 0);

      this.plansData.forEach(plan => {
        if (counts[plan.category] !== undefined) {
          counts[plan.category]++;
        }
      });

      const allCountEl = document.getElementById('count-all');
      if (allCountEl) allCountEl.textContent = `(${counts.all})`;

      this.categories.forEach(cat => {
        const countEl = document.getElementById(`count-${cat}`);
        if (countEl) countEl.textContent = `(${counts[cat]})`;
      });
    },

    updateStats: function() {
      const filteredPlans = this.getFilteredPlans();
      const inProgressCount = filteredPlans.filter(p => p.status === 'in_progress').length;
      const todoCount = filteredPlans.filter(p => p.status === 'todo').length;
      const doneCount = filteredPlans.filter(p => p.status === 'done').length;
      const expiredCount = filteredPlans.filter(p => p.status === 'expired').length;

      const inProgressEl = document.getElementById('stat-in-progress');
      const todoEl = document.getElementById('stat-todo');
      const doneEl = document.getElementById('stat-done');
      const expiredEl = document.getElementById('stat-expired');

      if (inProgressEl) inProgressEl.textContent = inProgressCount;
      if (todoEl) todoEl.textContent = todoCount;
      if (doneEl) doneEl.textContent = doneCount;
      if (expiredEl) expiredEl.textContent = expiredCount;
    },

    updateWeeklyProgress: function() {
      const filteredPlans = this.getFilteredPlans();
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');

      if (!progressFill || !progressText) return;

      const total = filteredPlans.length;
      const done = filteredPlans.filter(p => p.status === 'done').length;

      const percentage = total > 0 ? (done / total) * 100 : 0;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${done}/${total}`;
    },

    updateTodayPlans: function() {
      const container = document.getElementById('today-plans');
      if (!container) return;

      const today = new Date();
      const todayStr = this.formatDate(today);

      const filteredPlans = this.getFilteredPlans();
      const todayPlans = filteredPlans.filter(plan => this.isDateWithinPlan(todayStr, plan));

      if (todayPlans.length === 0) {
        container.innerHTML = `
          <div class="empty-today">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p>${window.i18n_todo || '暂无计划'}</p>
          </div>
        `;
        return;
      }

      const statusLabels = {
        'todo': '待办',
        'in_progress': '进行中',
        'done': '已完成',
        'expired': '超时'
      };

      container.innerHTML = todayPlans.map(plan => `
        <div class="today-plan-card ${plan.status}">
          <h4 class="today-plan-title">${plan.title}</h4>
          <p class="today-plan-description">${plan.description}</p>
          <div class="today-plan-meta">
            <span class="today-plan-category">${plan.category}</span>
          </div>
        </div>
      `).join('');
    },

    renderTimeline: function() {
      const container = document.getElementById('timeline-container');
      if (!container) return;

      const filteredPlans = this.getFilteredPlans();

      if (filteredPlans.length === 0) {
        container.innerHTML = `
          <div class="empty-timeline">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h3>暂无计划</h3>
            <p>没有找到符合条件的计划</p>
          </div>
        `;
        return;
      }

      const sortedPlans = filteredPlans.slice().sort((a, b) => {
        return a.start_date.localeCompare(b.start_date);
      });

      const groupedByMonth = {};
      sortedPlans.forEach(plan => {
        const monthKey = plan.start_date.slice(0, 7);
        if (!groupedByMonth[monthKey]) {
          groupedByMonth[monthKey] = [];
        }
        groupedByMonth[monthKey].push(plan);
      });

      const statusOrder = ['in_progress', 'todo', 'done', 'expired'];
      const statusLabels = {
        'in_progress': '进行中',
        'todo': '待办',
        'done': '已完成',
        'expired': '超时'
      };
      const statusColors = {
        'in_progress': 'progress',
        'todo': 'todo',
        'done': 'done',
        'expired': 'expired'
      };

      let html = '';

      Object.keys(groupedByMonth).forEach(monthKey => {
        const monthPlans = groupedByMonth[monthKey];
        html += `
          <div class="timeline-month collapsed" data-month="${monthKey}">
            <div class="timeline-month-header">
              <button class="month-collapse-btn" aria-label="Toggle month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <span class="timeline-dot"></span>
              <h3 class="timeline-month-title">${monthKey.slice(0, 4)} 年 ${Number(monthKey.slice(5, 7))} 月</h3>
              <span class="month-item-count">${monthPlans.length} 项</span>
            </div>
            <div class="timeline-items">
        `;

        statusOrder.forEach(status => {
          const statusPlans = monthPlans.filter(p => p.status === status);
          if (statusPlans.length === 0) return;

          html += `
            <div class="status-group" data-status="${status}">
              <div class="status-group-header">
                <span class="status-group-dot ${statusColors[status]}"></span>
                <span class="status-group-title">${statusLabels[status]}</span>
                <span class="status-group-count">${statusPlans.length}</span>
              </div>
          `;

          statusPlans.forEach(plan => {
            html += `
              <div class="timeline-item" data-status="${plan.status}" data-category="${plan.category}" data-start-date="${plan.start_date}">
                <div class="timeline-item-marker">
                  <span class="timeline-item-dot ${plan.status}"></span>
                </div>
                <div class="timeline-item-content">
                  <div class="timeline-item-header">
                    <h4 class="timeline-item-title">${plan.title}</h4>
                  </div>
                  <p class="timeline-item-description">${plan.description}</p>
                  <div class="timeline-item-meta">
                    <span class="timeline-item-category">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                      ${plan.category}
                    </span>
                    <span class="timeline-item-dates">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      ${plan.start_date} ~ ${plan.end_date}
                    </span>
                  </div>
                </div>
              </div>
            `;
          });

          html += '</div>';
        });

        html += '</div></div>';
      });

      container.innerHTML = html;

      this.initCollapsibleMonths();
      this.bindTimelineEvents();
    },

    initCollapsibleMonths: function() {
      document.querySelectorAll('.timeline-month-header').forEach(header => {
        header.addEventListener('click', (e) => {
          const month = header.closest('.timeline-month');
          month.classList.toggle('collapsed');
        });
      });

      document.querySelectorAll('.status-group-header').forEach(header => {
        header.addEventListener('click', (e) => {
          const group = header.closest('.status-group');
          group.classList.toggle('collapsed');
        });
      });
    },

    bindTimelineEvents: function() {
      document.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', () => {
          const dateStr = item.dataset.startDate;
          const category = item.dataset.category;
          const filteredPlans = this.getFilteredPlans().filter(p => 
            p.category === category && p.start_date === dateStr
          );
          if (filteredPlans.length > 0) {
            this.openDetailPanel(dateStr, filteredPlans);
          }
        });
      });
    },

    renderCategoryView: function() {
      const container = document.getElementById('timeline-container');
      if (!container) return;

      const filteredPlans = this.getFilteredPlans();

      const tagColors = ['dev', 'study', 'ops', 'rlhf', 'ai', 'life'];
      const statusOrder = ['in_progress', 'todo', 'done', 'expired'];
      const statusLabels = {
        'in_progress': '进行中',
        'todo': '待办',
        'done': '已完成',
        'expired': '超时'
      };
      const statusColors = {
        'in_progress': 'progress',
        'todo': 'todo',
        'done': 'done',
        'expired': 'expired'
      };

      let html = '<div class="category-view" id="category-view">';

      this.categories.forEach((cat, index) => {
        const catPlans = filteredPlans.filter(p => p.category === cat);
        if (catPlans.length === 0) return;

        const colorClass = tagColors[index % tagColors.length];

        html += `
          <div class="category-section collapsed" data-category="${cat}">
            <div class="category-section-header">
              <button class="category-collapse-btn" aria-label="Toggle category">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <span class="category-dot ${colorClass}"></span>
              <h3 class="category-section-title">${cat}</h3>
              <span class="category-count">${catPlans.length} 项</span>
            </div>
            <div class="category-items">
        `;

        statusOrder.forEach(status => {
          const statusPlans = catPlans.filter(p => p.status === status);
          if (statusPlans.length === 0) return;

          html += `
            <div class="status-group" data-status="${status}">
              <div class="status-group-header">
                <span class="status-group-dot ${statusColors[status]}"></span>
                <span class="status-group-title">${statusLabels[status]}</span>
                <span class="status-group-count">${statusPlans.length}</span>
              </div>
          `;

          statusPlans.sort((a, b) => a.start_date.localeCompare(b.start_date)).forEach(plan => {
            html += `
              <div class="timeline-item" data-status="${plan.status}" data-category="${plan.category}" data-start-date="${plan.start_date}">
                <div class="timeline-item-marker">
                  <span class="timeline-item-dot ${plan.status}"></span>
                </div>
                <div class="timeline-item-content">
                  <div class="timeline-item-header">
                    <h4 class="timeline-item-title">${plan.title}</h4>
                  </div>
                  <p class="timeline-item-description">${plan.description}</p>
                  <div class="timeline-item-meta">
                    <span class="timeline-item-dates">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      ${plan.start_date} ~ ${plan.end_date}
                    </span>
                  </div>
                </div>
              </div>
            `;
          });

          html += '</div>';
        });

        html += '</div></div>';
      });

      html += '</div>';
      container.innerHTML = html;

      this.initCollapsibleCategories();
      this.bindTimelineEvents();
    },

    initCollapsibleCategories: function() {
      document.querySelectorAll('.category-section-header').forEach(header => {
        header.addEventListener('click', (e) => {
          const section = header.closest('.category-section');
          section.classList.toggle('collapsed');
        });
      });
    },

    getMonthData: function(year, month) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDay = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      const today = new Date();

      return {
        firstDay,
        lastDay,
        startDay,
        daysInMonth,
        today,
        year,
        month
      };
    },

    getPlansForDate: function(date) {
      const dateStr = this.formatDate(date);
      return this.plansData.filter(plan => this.isDateWithinPlan(dateStr, plan));
    },

    getTodayPlans: function() {
      const today = new Date();
      return this.getPlansForDate(today);
    },

    formatDate: function(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    getStatusPriority: function(status) {
      const priority = { 'in_progress': 0, 'todo': 1, 'done': 2, 'expired': 3 };
      return priority[status] ?? 4;
    },

    renderMiniCalendar: function() {
      const grid = document.getElementById('mini-calendar-grid');
      const monthTitle = document.getElementById('mini-month-title');
      if (!grid || !monthTitle) return;

      monthTitle.textContent = `${this.currentYear} 年 ${this.currentMonth + 1} 月`;

      const data = this.getMonthData(this.currentYear, this.currentMonth);
      let html = '';
      const totalCells = Math.ceil((data.startDay + data.daysInMonth) / 7) * 7;

      for (let i = 0; i < totalCells; i++) {
        const dayNum = i - data.startDay + 1;
        const date = new Date(this.currentYear, this.currentMonth, dayNum);
        const isCurrentMonth = dayNum >= 1 && dayNum <= data.daysInMonth;
        const isToday = this.isSameDay(date, data.today);
        const plans = isCurrentMonth ? this.getPlansForDate(date) : [];
        const hasEvents = plans.length > 0;

        let classes = ['mini-day'];
        if (!isCurrentMonth) classes.push('other-month');
        if (isToday) classes.push('today');
        if (hasEvents) classes.push('has-events');

        html += `<div class="${classes.join(' ')}" data-date="${this.formatDate(date)}" ${isCurrentMonth ? 'tabindex="0"' : ''}>${isCurrentMonth ? dayNum : ''}</div>`;
      }

      grid.innerHTML = html;

      const dayElements = grid.querySelectorAll('.mini-day[data-date]');
      dayElements.forEach(dayEl => {
        dayEl.addEventListener('click', () => this.handleDayClick(dayEl));
      });
    },

    isSameDay: function(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    },

    handleDayClick: function(dayEl) {
      const dateStr = dayEl.dataset.date;
      const plans = this.plansData
        .filter(plan => this.isDateWithinPlan(dateStr, plan))
        .sort((a, b) => this.getStatusPriority(a.status) - this.getStatusPriority(b.status));

      if (plans.length > 0) {
        this.openDetailPanel(dateStr, plans);
      }
    },

    openDetailPanel: function(dateStr, plans) {
      const panel = document.getElementById('detail-panel');
      const overlay = document.getElementById('detail-overlay');
      const dateEl = document.getElementById('detail-date');
      const contentEl = document.getElementById('detail-panel-content');

      if (!panel || !overlay || !dateEl || !contentEl) return;

      const date = this.parseLocalDate(dateStr);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.textContent = date.toLocaleDateString('zh-CN', options);

      const statusLabels = {
        'todo': '待办',
        'in_progress': '进行中',
        'done': '已完成',
        'expired': '超时'
      };

      const categoryLabels = {
        '开发': '开发',
        '学习': '学习',
        '运营': '运营'
      };

      contentEl.innerHTML = plans.map(plan => `
        <div class="detail-plan-item ${plan.status}">
          <h4 class="detail-plan-title">${plan.title}</h4>
          <p class="detail-plan-description">${plan.description}</p>
          <div class="detail-plan-meta">
            <span class="detail-status-badge ${plan.status}">${statusLabels[plan.status] || plan.status}</span>
            <span class="detail-plan-category">${categoryLabels[plan.category] || plan.category}</span>
            <span class="detail-plan-dates">${plan.start_date} ~ ${plan.end_date}</span>
          </div>
        </div>
      `).join('');

      panel.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    },

    closeDetailPanel: function() {
      const panel = document.getElementById('detail-panel');
      const overlay = document.getElementById('detail-overlay');

      if (panel) panel.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    },

    changeMonth: function(delta) {
      this.currentMonth += delta;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.renderMiniCalendar();
    },

    renderTodayPlans: function() {
      const container = document.getElementById('today-plans');
      if (!container) return;

      const todayPlans = this.getTodayPlans();

      if (todayPlans.length === 0) {
        container.innerHTML = `
          <div class="empty-today">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p>${window.i18n_todo || '暂无计划'}</p>
          </div>
        `;
        return;
      }

      const statusLabels = {
        'todo': '待办',
        'in_progress': '进行中',
        'done': '已完成',
        'expired': '超时'
      };

      container.innerHTML = todayPlans.map(plan => `
        <div class="today-plan-card ${plan.status}">
          <h4 class="today-plan-title">${plan.title}</h4>
          <p class="today-plan-description">${plan.description}</p>
          <div class="today-plan-meta">
            <span class="today-plan-category">${plan.category}</span>
          </div>
        </div>
      `).join('');
    },

    renderStats: function() {
      const inProgressCount = this.plansData.filter(p => p.status === 'in_progress').length;
      const todoCount = this.plansData.filter(p => p.status === 'todo').length;
      const doneCount = this.plansData.filter(p => p.status === 'done').length;
      const expiredCount = this.plansData.filter(p => p.status === 'expired').length;

      const inProgressEl = document.getElementById('stat-in-progress');
      const todoEl = document.getElementById('stat-todo');
      const doneEl = document.getElementById('stat-done');
      const expiredEl = document.getElementById('stat-expired');

      if (inProgressEl) inProgressEl.textContent = inProgressCount;
      if (todoEl) todoEl.textContent = todoCount;
      if (doneEl) doneEl.textContent = doneCount;
      if (expiredEl) expiredEl.textContent = expiredCount;
    },

    renderWeeklyProgress: function() {
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');

      if (!progressFill || !progressText) return;

      const total = this.plansData.length;
      const done = this.plansData.filter(p => p.status === 'done').length;

      const percentage = total > 0 ? (done / total) * 100 : 0;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${done}/${total}`;
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.schedule-page')) {
      Schedule.init();
    }
  });

  window.Schedule = Schedule;
})();
