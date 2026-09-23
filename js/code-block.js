/**
 * Progressive enhancement for Hexo highlight.js code blocks.
 *
 * Hexo's original figure/table structure is intentionally preserved so syntax
 * highlighting and the no-JavaScript fallback keep working. Layout and visual
 * styling live in CSS; this module only adds the toolbar, scroll region and
 * copy interaction.
 */
(function () {
  'use strict';

  const ENHANCED_ATTRIBUTE = 'data-code-enhanced';
  const COPY_RESET_DELAY = 1800;
  const resetTimers = new WeakMap();
  const scrollObservers = new WeakMap();

  const LANGUAGE_NAMES = {
    bash: 'Bash',
    c: 'C',
    cpp: 'C++',
    css: 'CSS',
    diff: 'Diff',
    dockerfile: 'Dockerfile',
    go: 'Go',
    html: 'HTML',
    http: 'HTTP',
    java: 'Java',
    javascript: 'JavaScript',
    js: 'JavaScript',
    json: 'JSON',
    jsx: 'JSX',
    kotlin: 'Kotlin',
    markdown: 'Markdown',
    nginx: 'Nginx',
    plaintext: 'Text',
    python: 'Python',
    py: 'Python',
    ruby: 'Ruby',
    rust: 'Rust',
    scss: 'SCSS',
    shell: 'Shell',
    sql: 'SQL',
    swift: 'Swift',
    text: 'Text',
    ts: 'TypeScript',
    tsx: 'TSX',
    typescript: 'TypeScript',
    vue: 'Vue',
    xml: 'XML',
    yaml: 'YAML',
    yml: 'YAML'
  };

  function getDirectChild(element, tagName) {
    return Array.from(element.children).find(
      (child) => child.tagName.toLowerCase() === tagName
    );
  }

  function getLanguage(block) {
    const ignoredClasses = new Set(['highlight', 'code-block']);
    const languageClass = Array.from(block.classList).find(
      (className) => !ignoredClasses.has(className)
    );
    const language = (block.dataset.language || languageClass || 'text').toLowerCase();

    return LANGUAGE_NAMES[language] || language.replace(/(^|[-_])(\w)/g, (_, separator, letter) => (
      `${separator ? ' ' : ''}${letter.toUpperCase()}`
    ));
  }

  function extractCode(pre) {
    const lines = Array.from(pre.children).filter(
      (child) => child.classList.contains('line')
    );

    if (lines.length) {
      return lines.map((line) => line.textContent).join('\n');
    }

    const clone = pre.cloneNode(true);
    clone.querySelectorAll('br').forEach((lineBreak) => lineBreak.replaceWith('\n'));
    return clone.textContent.replace(/\n$/, '');
  }

  function legacyCopy(text) {
    return new Promise((resolve, reject) => {
      const activeElement = document.activeElement;
      const selection = window.getSelection();
      const ranges = selection
        ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange())
        : [];
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.inset = '-9999px auto auto -9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        if (!document.execCommand('copy')) {
          throw new Error('Copy command was rejected');
        }
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        textarea.remove();
        if (activeElement instanceof HTMLElement) {
          try {
            activeElement.focus({ preventScroll: true });
          } catch (error) {
            activeElement.focus();
          }
        }
        if (selection && ranges.length) {
          selection.removeAllRanges();
          ranges.forEach((range) => selection.addRange(range));
        }
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text);
    }

    return legacyCopy(text);
  }

  function createCopyIcon() {
    const namespace = 'http://www.w3.org/2000/svg';
    const icon = document.createElementNS(namespace, 'svg');
    icon.classList.add('code-block-copy-icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('width', '16');
    icon.setAttribute('height', '16');
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('focusable', 'false');

    const front = document.createElementNS(namespace, 'rect');
    front.setAttribute('x', '8');
    front.setAttribute('y', '8');
    front.setAttribute('width', '11');
    front.setAttribute('height', '11');
    front.setAttribute('rx', '2');

    const back = document.createElementNS(namespace, 'path');
    back.setAttribute('d', 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2');

    icon.append(front, back);
    return icon;
  }

  function setCopyState(button, status, state, message) {
    button.dataset.copyState = state;
    button.querySelector('.code-block-copy-label').textContent = message;
    button.setAttribute('aria-label', message);
    status.textContent = state === 'idle' ? '' : message;
  }

  function scheduleCopyReset(button, status) {
    const previousTimer = resetTimers.get(button);
    if (previousTimer) {
      window.clearTimeout(previousTimer);
    }

    const timer = window.setTimeout(() => {
      setCopyState(button, status, 'idle', '复制');
      resetTimers.delete(button);
    }, COPY_RESET_DELAY);

    resetTimers.set(button, timer);
  }

  function clearCopyReset(button) {
    const timer = resetTimers.get(button);
    if (timer) {
      window.clearTimeout(timer);
      resetTimers.delete(button);
    }
  }

  function createHeader(language, pre) {
    const header = document.createElement('div');
    header.className = 'code-block-header';

    const languageLabel = document.createElement('span');
    languageLabel.className = 'code-block-language';
    languageLabel.textContent = language;

    const actions = document.createElement('div');
    actions.className = 'code-block-actions';

    const status = document.createElement('span');
    status.className = 'code-block-status sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const copyButton = document.createElement('button');
    copyButton.className = 'code-block-copy';
    copyButton.type = 'button';
    copyButton.dataset.copyState = 'idle';
    copyButton.setAttribute('aria-label', '复制');

    const copyLabel = document.createElement('span');
    copyLabel.className = 'code-block-copy-label';
    copyLabel.textContent = '复制';
    copyButton.append(createCopyIcon(), copyLabel);

    copyButton.addEventListener('click', async () => {
      if (copyButton.dataset.copyState === 'copying') {
        return;
      }

      clearCopyReset(copyButton);
      copyButton.setAttribute('aria-disabled', 'true');
      setCopyState(copyButton, status, 'copying', '复制中');

      try {
        await copyText(extractCode(pre));
        setCopyState(copyButton, status, 'success', '已复制');
      } catch (error) {
        setCopyState(copyButton, status, 'error', '复制失败');
      } finally {
        copyButton.removeAttribute('aria-disabled');
        scheduleCopyReset(copyButton, status);
      }
    });

    actions.append(status, copyButton);
    header.append(languageLabel, actions);
    return header;
  }

  function observeScrollability(content, table, language) {
    const update = () => {
      const isScrollable = (
        content.scrollWidth > content.clientWidth + 1 ||
        content.scrollHeight > content.clientHeight + 1
      );

      content.toggleAttribute('data-code-scrollable', isScrollable);
      if (isScrollable) {
        content.tabIndex = 0;
        content.setAttribute('role', 'region');
        content.setAttribute('aria-label', `${language} 代码`);
      } else {
        content.removeAttribute('tabindex');
        content.removeAttribute('role');
        content.removeAttribute('aria-label');
      }
    };

    update();

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(update);
      observer.observe(content);
      observer.observe(table);
      scrollObservers.set(content, observer);
    } else {
      window.addEventListener('resize', update, { passive: true });
    }
  }

  function enhanceCodeBlock(block) {
    if (block.hasAttribute(ENHANCED_ATTRIBUTE)) {
      return;
    }

    const table = getDirectChild(block, 'table');
    const pre = table && table.querySelector('.code > pre');
    if (!table || !pre) {
      return;
    }

    const language = getLanguage(block);
    const header = createHeader(language, pre);
    const content = document.createElement('div');
    content.className = 'code-block-content';

    table.setAttribute('role', 'presentation');
    table.querySelectorAll('.gutter').forEach((gutter) => {
      gutter.setAttribute('aria-hidden', 'true');
    });

    table.before(content);
    content.appendChild(table);
    content.before(header);
    block.classList.add('code-block');
    block.setAttribute(ENHANCED_ATTRIBUTE, '');
    observeScrollability(content, table, language);
  }

  function init(root = document) {
    root.querySelectorAll('figure.highlight').forEach(enhanceCodeBlock);
  }

  window.SidoCodeBlocks = { init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }
})();
