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
  
  // Add scrolled class when scrolling down
  if (currentScroll > scrollThreshold) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  if (currentScroll > window.previousScroll && currentScroll > scrollThreshold) {
    // Scrolling down and past threshold - hide header
    header.style.transform = 'translateY(-100%)';
  } else {
    // Scrolling up or not past threshold - show header
    header.style.transform = 'translateY(0)';
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
      
      // Only apply smooth scroll to internal anchor links
      if (href.startsWith('#')) {
        e.preventDefault();
        
        // Scroll to target
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
      // For links starting with '/', let the browser handle the navigation normally
    });
  });
});