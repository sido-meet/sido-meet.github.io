// Scroll animation functionality
document.addEventListener('DOMContentLoaded', function() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        // Optionally unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all elements with data-aos attribute
  const aosElements = document.querySelectorAll('[data-aos]');
  aosElements.forEach(el => {
    observer.observe(el);
  });
  
  // Add staggered animation delays for grid items
  const grids = document.querySelectorAll('.posts-grid, .terms-grid, .thoughts-grid, .links-grid, .skills-grid, .features-grid');
  grids.forEach(grid => {
    const items = grid.children;
    Array.from(items).forEach((item, index) => {
      if (!item.hasAttribute('data-aos-delay')) {
        item.style.animationDelay = `${index * 0.1}s`;
      }
    });
  });
  
  // Smooth reveal for hero sections
  const heroSections = document.querySelectorAll('.hero-section');
  heroSections.forEach(hero => {
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      hero.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0)';
    }, 100);
  });
  
  // Card hover animations
  const cards = document.querySelectorAll('.post-card, .term-card, .thought-card, .link-card, .skill-card, .feature-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Button ripple effect
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Add ripple animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Tech circles animation in hero section
  const techCircles = document.querySelectorAll('.tech-circles .circle');
  techCircles.forEach((circle, index) => {
    circle.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
    circle.style.animationDelay = `${index * 0.2}s`;
  });
  
  // Add float animation keyframes
  const floatStyle = document.createElement('style');
  floatStyle.textContent = `
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `;
  document.head.appendChild(floatStyle);
  
  // Reading progress bar animation
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', function() {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }
  
  // Lazy load images
  const lazyImages = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });
});

// AOS-like animation styles
const aosStyles = document.createElement('style');
aosStyles.textContent = `
  [data-aos] {
    opacity: 0;
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }
  
  [data-aos="fade-up"] {
    transform: translateY(30px);
  }
  
  [data-aos="fade-down"] {
    transform: translateY(-30px);
  }
  
  [data-aos="fade-left"] {
    transform: translateX(30px);
  }
  
  [data-aos="fade-right"] {
    transform: translateX(-30px);
  }
  
  [data-aos="zoom-in"] {
    transform: scale(0.9);
  }
  
  [data-aos="zoom-out"] {
    transform: scale(1.1);
  }
  
  [data-aos].aos-animate {
    opacity: 1;
    transform: translateY(0) translateX(0) scale(1);
  }
`;
document.head.appendChild(aosStyles);
