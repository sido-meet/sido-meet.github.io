/**
 * Enhanced Code Block Functionality
 * Provides advanced code block features with copy button, language labeling, and improved styling
 */

// Log script initialization
console.log('=== Code block enhancement script loaded ===');

/**
 * Initialize code block enhancements
 */
function initializeCodeBlocks() {
  console.log('=== Initializing code blocks ===');
  
  // 立即隐藏所有原始代码块，防止闪烁
  const codeBlocks = document.querySelectorAll('figure.highlight');
  codeBlocks.forEach(block => {
    block.style.opacity = '0';
    block.style.transition = 'opacity 0.2s ease';
  });
  
  // Exit early if no code blocks found
  if (codeBlocks.length === 0) {
    console.log('No code blocks found, skipping enhancement');
    return;
  }
  
  // Wait a short time to ensure DOM is fully loaded
  setTimeout(() => {
    console.log('Found code blocks:', codeBlocks.length);
    
    // Process each code block
    codeBlocks.forEach((block, index) => {
      console.log(`Processing code block ${index}: ${block.className}`);
      
      // Create container element
      const container = document.createElement('div');
      container.className = 'code-block';
      
      // 创建时就设置透明度为0，准备平滑过渡
      container.style.opacity = '0';
      container.style.transition = 'opacity 0.2s ease';
      
      // Create header with language label and copy button
      const header = createCodeBlockHeader(block);
      container.appendChild(header);
      
      // Create content wrapper and move original content
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'code-block-content';
      
      // Move all child nodes to the new wrapper
      while (block.firstChild) {
        contentWrapper.appendChild(block.firstChild);
      }
      container.appendChild(contentWrapper);
      
      // Debug: Check computed styles before replacement
      console.log('Before replacement - block computed styles:', getComputedStyle(block));
      
      // Replace original block with enhanced container
      if (block.parentNode) {
        block.parentNode.replaceChild(container, block);
        console.log(`Code block ${index} enhanced successfully`);
        
        // 立即应用基本样式，确保结构正确
        applyBaseStyles(container, contentWrapper);
        
        // 延迟应用完整样式，确保DOM完全更新
        setTimeout(() => {
          applyCompleteStyles(container, contentWrapper);
          
          // 样式应用完成后，平滑显示容器
          setTimeout(() => {
            container.style.opacity = '1';
            console.log(`Code block ${index} displayed successfully`);
          }, 50);
        }, 50);
      } else {
        console.error('Block has no parent node, cannot enhance');
      }
    });
    
    console.log('=== Code block enhancement completed ===');
  }, 50); // 减少延迟，加快处理速度
}

/**
 * Apply base styles to code block elements
 * @param {HTMLElement} container - The code block container
 * @param {HTMLElement} contentWrapper - The content wrapper
 * @private
 */
function applyBaseStyles(container, contentWrapper) {
  // Apply base styles to ensure consistency during transition
  container.style.backgroundColor = '#2c3e50';
  container.style.color = '#ffffff';
  container.style.padding = '0';
  container.style.marginBottom = '1.5rem';
  container.style.borderRadius = '8px';
  container.style.overflow = 'hidden';
  container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  
  contentWrapper.style.backgroundColor = '#2c3e50';
  contentWrapper.style.color = '#ffffff';
  contentWrapper.style.padding = '0';
}

/**
 * Apply complete styles to code block elements
 * @param {HTMLElement} container - The code block container
 * @param {HTMLElement} contentWrapper - The content wrapper
 * @private
 */
function applyCompleteStyles(container, contentWrapper) {
  // Apply styles to all code elements
  const codeElements = contentWrapper.querySelectorAll('pre, code');
  codeElements.forEach(el => {
    el.style.backgroundColor = 'transparent';
    el.style.color = '#ffffff';
    el.style.padding = '0';
    el.style.margin = '0';
    el.style.borderRadius = '0';
    el.style.boxShadow = 'none';
    el.style.fontFamily = "'Fira Code', 'Courier New', Courier, monospace";
    el.style.fontSize = '0.875rem';
    el.style.lineHeight = '1.5';
  });
  
  // Apply styles to table elements
  const tables = contentWrapper.querySelectorAll('table');
  tables.forEach(table => {
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.margin = '0';
    table.style.padding = '0';
    table.style.backgroundColor = 'transparent';
  });
  
  // Apply styles to tbody
  const tbodies = contentWrapper.querySelectorAll('tbody');
  tbodies.forEach(tbody => {
    tbody.style.margin = '0';
    tbody.style.padding = '0';
  });
  
  // Apply styles to tr
  const trs = contentWrapper.querySelectorAll('tr');
  trs.forEach(tr => {
    tr.style.margin = '0';
    tr.style.padding = '0';
    tr.style.backgroundColor = 'transparent';
  });
  
  // Apply styles to gutter
  const gutter = contentWrapper.querySelector('.gutter');
  if (gutter) {
    gutter.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    gutter.style.color = 'rgba(255, 255, 255, 0.5)';
    gutter.style.padding = '1.5rem 0';
    gutter.style.textAlign = 'right';
    gutter.style.verticalAlign = 'top';
    gutter.style.width = '50px';
    gutter.style.borderRight = '1px solid rgba(255, 255, 255, 0.1)';
    
    // Apply styles to gutter pre
    const gutterPre = gutter.querySelector('pre');
    if (gutterPre) {
      gutterPre.style.backgroundColor = 'transparent';
      gutterPre.style.color = 'rgba(255, 255, 255, 0.5)';
      gutterPre.style.margin = '0';
      gutterPre.style.padding = '0 12px';
      gutterPre.style.fontFamily = "'Fira Code', 'Courier New', Courier, monospace";
      gutterPre.style.fontSize = '0.875rem';
      gutterPre.style.lineHeight = '1.5';
    }
  }
  
  // Apply styles to code content
  const codeContent = contentWrapper.querySelector('.code');
  if (codeContent) {
    codeContent.style.padding = '0';
    codeContent.style.verticalAlign = 'top';
    codeContent.style.width = '100%';
    
    // Apply styles to code pre
    const codePre = codeContent.querySelector('pre');
    if (codePre) {
      codePre.style.backgroundColor = 'transparent';
      codePre.style.color = '#ffffff';
      codePre.style.margin = '0';
      codePre.style.padding = '1.5rem';
      codePre.style.fontFamily = "'Fira Code', 'Courier New', Courier, monospace";
      codePre.style.fontSize = '0.875rem';
      codePre.style.lineHeight = '1.5';
      codePre.style.overflowX = 'auto';
      codePre.style.borderRadius = '0';
      codePre.style.boxShadow = 'none';
    }
  }
  
  console.log('Complete styles applied successfully');
}

// Use window.onload to ensure all resources are loaded
window.onload = function() {
  console.log('=== Window load event fired ===');
  initializeCodeBlocks();
};

// Also try DOMContentLoaded as fallback
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCodeBlocks);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
  // DOM is already loaded
  initializeCodeBlocks();
}

/**
 * Create code block header with language label and copy button
 * @param {HTMLElement} block - The original code block element
 * @returns {HTMLElement} - The created header element
 * @private
 */
function createCodeBlockHeader(block) {
  const header = document.createElement('div');
  header.className = 'code-block-header';
  
  // Add language label
  const langLabel = createLanguageLabel(block);
  header.appendChild(langLabel);
  
  // Add copy button
  const copyBtn = createCopyButton();
  header.appendChild(copyBtn);
  
  return header;
}

/**
 * Create language label from code block classes
 * @param {HTMLElement} block - The original code block element
 * @returns {HTMLElement} - The created language label element
 * @private
 */
function createLanguageLabel(block) {
  const langLabel = document.createElement('span');
  langLabel.className = 'code-block-language';
  
  // Extract language from class names
  let language = 'Code';
  const classes = block.className.split(' ');
  
  for (const className of classes) {
    if (className !== 'highlight' && className !== 'figure') {
      // Capitalize first letter and use as language name
      language = className.charAt(0).toUpperCase() + className.slice(1);
      break;
    }
  }
  
  langLabel.textContent = language;
  return langLabel;
}

/**
 * Create copy button with click functionality
 * @returns {HTMLElement} - The created copy button element
 * @private
 */
function createCopyButton() {
  const copyBtn = document.createElement('button');
  copyBtn.className = 'code-block-btn';
  copyBtn.textContent = 'Copy';
  copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
  
  // Add copy functionality with visual feedback
  copyBtn.addEventListener('click', function() {
    // Find the code element within the same code block
    const codeElement = this.closest('.code-block').querySelector('.code pre');
    
    if (codeElement) {
      // Get complete code content
      const code = codeElement.textContent;
      
      // Copy to clipboard
      navigator.clipboard.writeText(code)
        .then(() => {
          // Show success feedback
          showCopySuccess(this);
        })
        .catch((err) => {
          // Show error feedback
          console.error('Copy failed:', err);
          showCopyError(this);
        });
    }
  });
  
  return copyBtn;
}

/**
 * Show copy success feedback
 * @param {HTMLElement} button - The copy button element
 * @private
 */
function showCopySuccess(button) {
  const originalText = button.textContent;
  
  // Update button state
  button.textContent = 'Copied!';
  button.classList.add('copied');
  
  // Reset after 2 seconds
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('copied');
  }, 2000);
}

/**
 * Show copy error feedback
 * @param {HTMLElement} button - The copy button element
 * @private
 */
function showCopyError(button) {
  const originalText = button.textContent;
  
  // Update button state
  button.textContent = 'Error';
  button.classList.add('error');
  
  // Reset after 2 seconds
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('error');
  }, 2000);
}
