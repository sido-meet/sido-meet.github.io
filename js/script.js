// Document ready event
Document.prototype.ready = function(callback) {
  if (this.readyState === "complete" || this.readyState === "interactive") {
    callback();
  } else {
    this.addEventListener("DOMContentLoaded", callback);
  }
};

// Smooth scrolling for navigation links
document.ready(function() {
  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Highlight active navigation link based on current URL
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (currentPath === linkPath || (currentPath.startsWith(linkPath) && linkPath !== '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile menu toggle (if needed in future)
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Add scroll event listener for header effects
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
      if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        header.style.boxShadow = 'none';
      }
    }
  });

  // Code block syntax highlighting enhancement
  const codeBlocks = document.querySelectorAll('pre code');
  codeBlocks.forEach(block => {
    // Add copy button to code blocks (optional)
    const preBlock = block.closest('pre');
    if (preBlock && !preBlock.querySelector('.copy-button')) {
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      copyButton.style.position = 'absolute';
      copyButton.style.top = '10px';
      copyButton.style.right = '10px';
      copyButton.style.padding = '5px 10px';
      copyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      copyButton.style.color = 'white';
      copyButton.style.border = 'none';
      copyButton.style.borderRadius = '3px';
      copyButton.style.cursor = 'pointer';
      copyButton.style.fontSize = '12px';
      copyButton.style.zIndex = '10';
      
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(block.textContent)
          .then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = 'Copy';
            }, 2000);
          })
          .catch(err => {
            console.error('Failed to copy: ', err);
          });
      });
      
      preBlock.style.position = 'relative';
      preBlock.appendChild(copyButton);
    }
  });

  // Image lazy loading (if needed)
  const images = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => {
      imgObserver.observe(img);
    });
  }

  // Add fade-in animation to elements when they come into view
  const fadeElements = document.querySelectorAll('.post, .post-detail');
  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          fadeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    fadeElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      fadeObserver.observe(element);
    });
  }
});

// Utility functions
const Utils = {
  // Debounce function to limit the rate at which a function can fire
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function to execute a function at most once every specified period
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};
