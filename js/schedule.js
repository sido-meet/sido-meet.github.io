(function() {
  'use strict';

  const Schedule = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    plansData: [],

    init: function() {
      if (typeof window.PLANS_DATA !== 'undefined') {
        this.plansData = window.PLANS_DATA;
      }
      this.bindEvents();
      this.renderMiniCalendar();
      this.renderTodayPlans();
      this.renderStats();
      this.renderWeeklyProgress();
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
      return this.plansData.filter(plan => {
        const start = new Date(plan.start_date);
        const end = new Date(plan.end_date);
        const checkDate = new Date(dateStr);
        return checkDate >= start && checkDate <= end;
      });
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
      const priority = { 'in_progress': 0, 'todo': 1, 'done': 2 };
      return priority[status] || 3;
    },

    renderMiniCalendar: function() {
      const grid = document.getElementById('mini-calendar-grid');
      const monthTitle = document.getElementById('mini-month-title');
      if (!grid || !monthTitle) return;

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      monthTitle.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

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
      const plans = this.plansData.filter(plan => {
        const start = new Date(plan.start_date);
        const end = new Date(plan.end_date);
        const checkDate = new Date(dateStr);
        return checkDate >= start && checkDate <= end;
      }).sort((a, b) => this.getStatusPriority(a.status) - this.getStatusPriority(b.status));

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

      const date = new Date(dateStr);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.textContent = date.toLocaleDateString('en-US', options);

      const statusLabels = {
        'todo': '待办',
        'in_progress': '进行中',
        'done': '已完成'
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
        'done': '已完成'
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
      const todoCount = this.plansData.filter(p => p.status === 'todo').length;
      const inProgressCount = this.plansData.filter(p => p.status === 'in_progress').length;
      const doneCount = this.plansData.filter(p => p.status === 'done').length;

      const todoEl = document.getElementById('stat-todo');
      const inProgressEl = document.getElementById('stat-in-progress');
      const doneEl = document.getElementById('stat-done');

      if (todoEl) todoEl.textContent = todoCount;
      if (inProgressEl) inProgressEl.textContent = inProgressCount;
      if (doneEl) doneEl.textContent = doneCount;
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
