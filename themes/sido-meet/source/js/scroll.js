// Scroll listener for header behavior
window.addEventListener('scroll', function() {
  const header = document.querySelector('.header');
  const main = document.querySelector('.main');
  
  // Store the previous scroll position
  if (window.previousScroll === undefined) {
    window.previousScroll = window.pageYOffset;
    return;
  }
  
  const currentScroll = window.pageYOffset;
  const scrollThreshold = 50; // Number of pixels to scroll before header hides
  
  if (currentScroll > window.previousScroll && currentScroll > scrollThreshold) {
    // Scrolling down and past threshold - hide header
    header.style.transform = 'translateY(-100%)';
    main.style.borderRadius = 'var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg)';
  } else {
    // Scrolling up or not past threshold - show header
    header.style.transform = 'translateY(0)';
    main.style.borderRadius = '0 0 var(--border-radius-lg) var(--border-radius-lg)';
  }
  
  // Update previous scroll position
  window.previousScroll = currentScroll;
});

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Only handle internal links
      if (href.startsWith('#') || href.startsWith('/')) {
        e.preventDefault();
        
        // Scroll to target
        const target = href.startsWith('#') ? document.querySelector(href) : document.getElementById('top');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});