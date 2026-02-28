// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (mobileMenuButton && mobileNav) {
    // Toggle mobile menu
    mobileMenuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('active');
      this.classList.toggle('active');
      
      // Toggle body scroll when menu is open
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu when clicking on a link
    const mobileNavLinks = mobileNav.querySelectorAll('.nav-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileNav.classList.remove('active');
        mobileMenuButton.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
      if (mobileNav.classList.contains('active') && 
          !mobileNav.contains(e.target) && 
          !mobileMenuButton.contains(e.target)) {
        mobileNav.classList.remove('active');
        mobileMenuButton.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // Close mobile menu on window resize (if switching to desktop view)
    window.addEventListener('resize', function() {
      if (window.innerWidth > 1024) {
        mobileNav.classList.remove('active');
        mobileMenuButton.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
        mobileNav.classList.remove('active');
        mobileMenuButton.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});
