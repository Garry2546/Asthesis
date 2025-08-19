// JavaScript for mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
  const isClickInsideNavbar = event.target.closest('.navbar') || 
                              event.target.closest('.mobile-menu');
  
  if (!isClickInsideNavbar && mobileMenu.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    hamburger.classList.remove('active');
  }
});

// Close menu when clicking on a link
const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-demo-button');
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    hamburger.classList.remove('active');
  });
});

// Close mobile menu when window is resized to desktop size
window.addEventListener('resize', () => {
  // Check if window width is above mobile breakpoint (768px)
  if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    hamburger.classList.remove('active');
  }
});

const navbar = document.querySelector('.navbar');
const scrollThreshold = 100;
let isFixed = false;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > scrollThreshold && !isFixed) {
    navbar.classList.add('fixed');
    navbar.classList.add('animating-in');
    isFixed = true;
    document.body.style.paddingTop = navbar.offsetHeight + 'px';
  } else if (currentScrollY <= scrollThreshold && isFixed) {
    // Instantly remove without animation
    navbar.classList.remove('fixed', 'animating-in', 'unfixed', 'animating-out');
    isFixed = false;
    document.body.style.paddingTop = '0';
  }
});

document.querySelectorAll('.nav-link[href="#"], .mobile-nav-link[href="#"]').forEach(link => {
  link.addEventListener('click', e => e.preventDefault());
});

// Infinite Carousel functionality with precise timing control and scroll-triggered start
class ModernCarousel {
  constructor() {
      this.track = document.getElementById('carouselTrack');
      this.slides = this.track.querySelectorAll('.carousel-slide');
      this.indicators = document.querySelectorAll('.indicator');
      this.prevBtn = document.getElementById('prevBtn');
      this.nextBtn = document.getElementById('nextBtn');
      
      this.originalSlides = this.slides.length;
      this.currentSlide = 1; // Start at 1 because we'll add clones
      this.isTransitioning = false;
      this.autoPlayInterval = null;
      this.userInteractionTimeout = null;
      this.isUserInteracting = false;
      this.slideInterval = 4000; // 4 seconds between slides
      
      // New properties for scroll-triggered start
      this.hasStarted = false;
      this.carouselElement = document.querySelector('.carousel-section');
      this.intersectionObserver = null;
      
      this.init();
  }
  
  init() {
      this.createInfiniteLoop();
      this.setupEventListeners();
      this.updateCarousel(false); // Initial position without transition
      
      // Set up intersection observer instead of starting auto-play immediately
      this.setupIntersectionObserver();
  }
  
  setupIntersectionObserver() {
      // Options for the intersection observer
      const options = {
          root: null, // Use viewport as root
          rootMargin: '-10% 0px', // Trigger when carousel is 10% into viewport
          threshold: 0.1 // Trigger when at least 10% of carousel is visible
      };
      
      // Create the observer
      this.intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              // Check if carousel is entering the viewport and hasn't started yet
              if (entry.isIntersecting && !this.hasStarted) {
                  this.hasStarted = true;
                  this.startAutoPlay();
                  
                  // Optional: disconnect observer after first trigger to save resources
                  // this.intersectionObserver.disconnect();
              }
              // Optional: pause when carousel leaves viewport
              else if (!entry.isIntersecting && this.hasStarted && !this.isUserInteracting) {
                  this.pauseAutoPlay();
              }
              // Optional: resume when carousel re-enters viewport
              else if (entry.isIntersecting && this.hasStarted && !this.isUserInteracting) {
                  this.startAutoPlay();
              }
          });
      }, options);
      
      // Start observing the carousel element
      if (this.carouselElement) {
          this.intersectionObserver.observe(this.carouselElement);
      }
  }
  
  // Alternative method using scroll event (if you prefer this over IntersectionObserver)
  setupScrollListener() {
      const checkCarouselVisibility = () => {
          if (!this.hasStarted && this.carouselElement) {
              const rect = this.carouselElement.getBoundingClientRect();
              const windowHeight = window.innerHeight || document.documentElement.clientHeight;
              
              // Check if carousel is in viewport (with some offset)
              const isVisible = rect.top <= windowHeight * 0.8 && rect.bottom >= 0;
              
              if (isVisible) {
                  this.hasStarted = true;
                  this.startAutoPlay();
                  
                  // Remove scroll listener after starting to save resources
                  window.removeEventListener('scroll', checkCarouselVisibility);
              }
          }
      };
      
      // Check on initial load
      checkCarouselVisibility();
      
      // Check on scroll
      window.addEventListener('scroll', checkCarouselVisibility);
  }
  
  createInfiniteLoop() {
      // Clone first and last slides for infinite effect
      const firstSlide = this.slides[0].cloneNode(true);
      const lastSlide = this.slides[this.slides.length - 1].cloneNode(true);
      
      // Add clones
      this.track.appendChild(firstSlide);
      this.track.insertBefore(lastSlide, this.slides[0]);
      
      // Update slides reference
      this.slides = this.track.querySelectorAll('.carousel-slide');
  }
  
  setupEventListeners() {
      this.prevBtn.addEventListener('click', () => this.handleUserInteraction('prev'));
      this.nextBtn.addEventListener('click', () => this.handleUserInteraction('next'));
      
      this.indicators.forEach((indicator, index) => {
          indicator.addEventListener('click', () => this.handleUserInteraction('goto', index + 1));
      });
      
      // Handle transition end for infinite loop
      this.track.addEventListener('transitionend', () => this.handleTransitionEnd());
      
      // Pause autoplay on hover but don't reset timing
      this.track.parentElement.addEventListener('mouseenter', () => {
          if (this.hasStarted) {
              this.pauseAutoPlay();
          }
      });
      
      this.track.parentElement.addEventListener('mouseleave', () => {
          if (!this.isUserInteracting && this.hasStarted) {
              this.startAutoPlay();
          }
      });
  }
  
  handleUserInteraction(action, slideIndex = null) {
      // If user interacts before auto-play has started, mark as started
      if (!this.hasStarted) {
          this.hasStarted = true;
      }
      
      // Stop auto-play immediately
      this.pauseAutoPlay();
      this.isUserInteracting = true;
      
      // Clear any existing timeout
      if (this.userInteractionTimeout) {
          clearTimeout(this.userInteractionTimeout);
      }
      
      // Perform the action
      switch(action) {
          case 'prev':
              this.prevSlide();
              break;
          case 'next':
              this.nextSlide();
              break;
          case 'goto':
              this.goToSlide(slideIndex);
              break;
      }
      
      // Set timeout to resume auto-play after 1 second of no interaction
      this.userInteractionTimeout = setTimeout(() => {
          this.isUserInteracting = false;
          if (this.hasStarted) {
              // Check if carousel is still in viewport before resuming
              if (this.carouselElement) {
                  const rect = this.carouselElement.getBoundingClientRect();
                  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                  if (isVisible) {
                      this.startAutoPlay();
                  }
              } else {
                  this.startAutoPlay();
              }
          }
      }, 1000);
  }
  
  updateCarousel(useTransition = true) {
      if (useTransition) {
          this.track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      } else {
          this.track.style.transition = 'none';
      }
      
      const translateX = -this.currentSlide * 100;
      this.track.style.transform = `translateX(${translateX}%)`;
      
      // Update indicators (adjust for cloned slides)
      this.updateIndicators();
  }
  
  updateIndicators() {
      const indicatorIndex = this.getIndicatorIndex();
      this.indicators.forEach((indicator, index) => {
          indicator.classList.toggle('active', index === indicatorIndex);
      });
  }
  
  getIndicatorIndex() {
      if (this.currentSlide === 0) return this.originalSlides - 1; // Last slide clone
      if (this.currentSlide === this.originalSlides + 1) return 0; // First slide clone
      return this.currentSlide - 1; // Normal slides
  }
  
  handleTransitionEnd() {
      this.isTransitioning = false;
      
      // Handle infinite loop repositioning
      if (this.currentSlide === 0) {
          // We're at the last slide clone, jump to actual last slide
          this.currentSlide = this.originalSlides;
          this.updateCarousel(false);
      } else if (this.currentSlide === this.originalSlides + 1) {
          // We're at the first slide clone, jump to actual first slide
          this.currentSlide = 1;
          this.updateCarousel(false);
      }
  }
  
  nextSlide() {
      if (this.isTransitioning) return;
      
      this.isTransitioning = true;
      this.currentSlide++;
      this.updateCarousel(true);
  }
  
  prevSlide() {
      if (this.isTransitioning) return;
      
      this.isTransitioning = true;
      this.currentSlide--;
      this.updateCarousel(true);
  }
  
  goToSlide(index) {
      if (this.isTransitioning) return;
      
      this.isTransitioning = true;
      this.currentSlide = index;
      this.updateCarousel(true);
  }
  
  startAutoPlay() {
      // Only start if not user interacting, no existing interval, and has been triggered
      if (this.isUserInteracting || this.autoPlayInterval || !this.hasStarted) return;
      
      this.autoPlayInterval = setInterval(() => {
          // Double check user isn't interacting and carousel has started
          if (!this.isUserInteracting && this.hasStarted) {
              this.nextSlide();
          }
      }, this.slideInterval);
  }
  
  pauseAutoPlay() {
      if (this.autoPlayInterval) {
          clearInterval(this.autoPlayInterval);
          this.autoPlayInterval = null;
      }
  }
  
  // Method to restart auto-play with fresh timing
  restartAutoPlay() {
      this.pauseAutoPlay();
      if (this.hasStarted) {
          this.startAutoPlay();
      }
  }
  
  // Clean up method (useful if you need to destroy the carousel)
  destroy() {
      if (this.intersectionObserver) {
          this.intersectionObserver.disconnect();
      }
      this.pauseAutoPlay();
      if (this.userInteractionTimeout) {
          clearTimeout(this.userInteractionTimeout);
      }
  }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ModernCarousel();
});