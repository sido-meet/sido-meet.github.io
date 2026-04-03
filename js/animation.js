// Advanced Animation System
// Enhanced animations and micro-interactions for sido-meet theme

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // 1. Intersection Observer for fade-in animations
  // ============================================
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        
        // Add staggered children animation
        const children = entry.target.querySelectorAll('.animate-child');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('aos-animate');
          }, index * 100);
        });
      }
    });
  }, observerOptions);
  
  // Observe all elements with data-aos attribute
  const aosElements = document.querySelectorAll('[data-aos]');
  aosElements.forEach(el => {
    observer.observe(el);
  });
  
  // ============================================
  // 2. Magnetic Button Effect
  // ============================================
  const magneticButtons = document.querySelectorAll('.btn-magnetic');
  
  magneticButtons.forEach(button => {
    button.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translate(0, 0)';
    });
  });
  
  // ============================================
  // 3. Enhanced Button Ripple Effect
  // ============================================
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // ============================================
  // 4. Text Scramble Effect for Headings
  // ============================================
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
    }
    
    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => this.resolve = resolve);
      this.queue = [];
      
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        this.queue.push({ from, to, start, end });
      }
      
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    
    update() {
      let output = '';
      let complete = 0;
      
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="scramble-char">${char}</span>`;
        } else {
          output += from;
        }
      }
      
      this.el.innerHTML = output;
      
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
    
    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }
  
  // Apply scramble effect to hero title
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const fx = new TextScramble(heroTitle);
    const originalText = heroTitle.innerText;
    
    // Trigger on page load
    setTimeout(() => {
      fx.setText(originalText);
    }, 500);
  }
  
  // ============================================
  // 5. Smooth Scroll with Easing
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;
        
        function step(timestamp) {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const ease = easeInOutCubic(Math.min(progress / duration, 1));
          window.scrollTo(0, startPosition + distance * ease);
          
          if (progress < duration) {
            window.requestAnimationFrame(step);
          }
        }
        
        function easeInOutCubic(t) {
          return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
        
        window.requestAnimationFrame(step);
      }
    });
  });
  
  // ============================================
  // 6. Parallax Effect for Hero Section
  // ============================================
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.3;
      heroSection.style.transform = `translateY(${rate}px)`;
    });
  }
  
  // ============================================
  // 7. Card Hover 3D Tilt Effect
  // ============================================
  const cards = document.querySelectorAll('.post-card, .skill-card, .feature-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
  
  // ============================================
  // 8. Typing Effect for Subtitle
  // ============================================
  const typeWriter = (element, text, speed = 50) => {
    let i = 0;
    element.textContent = '';
    
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    
    type();
  };
  
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    const originalText = heroSubtitle.textContent;
    setTimeout(() => {
      typeWriter(heroSubtitle, originalText, 30);
    }, 1500);
  }
  
  // ============================================
  // 9. Reading Progress Bar Animation
  // ============================================
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    let ticking = false;
    
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = (winScroll / height) * 100;
          progressBar.style.width = scrolled + '%';
          ticking = false;
        });
        ticking = true;
      }
    });
  }
  
  // ============================================
  // 10. Lazy Load Images with Fade In
  // ============================================
  const lazyImages = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.style.opacity = '0';
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        
        img.onload = () => {
          img.style.transition = 'opacity 0.5s ease-in-out';
          img.style.opacity = '1';
        };
        
        imageObserver.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });
  
  // ============================================
  // 11. Staggered Animation for Grid Items
  // ============================================
  const grids = document.querySelectorAll('.posts-grid, .terms-grid, .thoughts-grid, .links-grid, .skills-grid, .features-grid');
  grids.forEach(grid => {
    const items = grid.children;
    Array.from(items).forEach((item, index) => {
      if (!item.hasAttribute('data-aos-delay')) {
        item.style.setProperty('--animation-delay', `${index * 0.1}s`);
      }
    });
  });
  
  // ============================================
  // 12. Tech Circles Floating Animation
  // ============================================
  const techCircles = document.querySelectorAll('.tech-circles .circle');
  techCircles.forEach((circle, index) => {
    circle.style.setProperty('--animation-duration', `${3 + index * 0.5}s`);
    circle.style.setProperty('--animation-delay', `${index * 0.2}s`);
  });
  
  // ============================================
  // 13. Scroll Velocity Detection for Performance
  // ============================================
  let lastScrollTop = 0;
  let scrollVelocity = 0;
  
  window.addEventListener('scroll', () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    scrollVelocity = Math.abs(st - lastScrollTop);
    lastScrollTop = st <= 0 ? 0 : st;
    
    // Disable complex animations when scrolling fast
    if (scrollVelocity > 50) {
      document.body.classList.add('is-scrolling-fast');
    } else {
      document.body.classList.remove('is-scrolling-fast');
    }
  }, { passive: true });
  
  // ============================================
  // 14. Cursor Glow Effect
  // ============================================
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);
  
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animateCursor() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    
    cursorX += dx * 0.1;
    cursorY += dy * 0.1;
    
    cursorGlow.style.left = cursorX + 'px';
    cursorGlow.style.top = cursorY + 'px';
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
  
  // ============================================
  // 15. Navbar Show/Hide on Scroll
  // ============================================
  const header = document.querySelector('.header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
      header.classList.remove('scroll-up');
      return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
      header.classList.remove('scroll-up');
      header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
      header.classList.remove('scroll-down');
      header.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
  });
});
