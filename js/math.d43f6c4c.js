/**
 * KaTeX rendering for post bodies.
 *
 * KaTeX and the auto-render extension are vendored under /vendor/katex and are
 * only requested by the layout when a post actually contains math. This module
 * turns the delimiters that survived sanitization into rendered HTML.
 *
 * Display math (`$$…$$`, `\[…\]`) is enabled for every post that mentions it.
 * Inline `$…$` is opt-in through the post's `math: true` frontmatter, because
 * bare `$` is also ordinary text elsewhere on the site (currency amounts,
 * shell prompts, `${{ … }}` actions) and rendering those as math would corrupt
 * published content.
 */
(function () {
  'use strict';

  const CONTENT_SELECTOR = '.post-content';
  const INLINE_ATTRIBUTE = 'data-math-inline';
  const RENDERED_ATTRIBUTE = 'data-math-rendered';

  // Matches the auto-render extension's own defaults plus the TeX-style
  // delimiters. Inline pairs are only appended when the post opts in.
  const DISPLAY_DELIMITERS = [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true }
  ];

  const INLINE_DELIMITERS = [
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false }
  ];

  function allowsInlineMath() {
    return document.body.getAttribute(INLINE_ATTRIBUTE) === 'true';
  }

  function buildDelimiters() {
    return allowsInlineMath()
      ? DISPLAY_DELIMITERS.concat(INLINE_DELIMITERS)
      : DISPLAY_DELIMITERS.slice();
  }

  function renderContent(content) {
    if (
      !window.katex ||
      typeof window.renderMathInElement !== 'function' ||
      content.getAttribute(RENDERED_ATTRIBUTE)
    ) {
      return;
    }

    content.setAttribute(RENDERED_ATTRIBUTE, '');

    window.renderMathInElement(content, {
      delimiters: buildDelimiters(),
      // Code blocks and hidden fields hold shell prompts and template syntax
      // whose `$` characters must stay literal.
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
      ignoredClasses: ['highlight', 'code-block', 'katex'],
      throwOnError: false,
      errorCallback() {}
    });
  }

  function init(root = document) {
    const content = root.querySelector(CONTENT_SELECTOR);
    if (content) {
      renderContent(content);
    }
  }

  window.SidoMath = { init, allowsInlineMath };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }
})();