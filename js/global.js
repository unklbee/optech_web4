// global.js start

/**
 * Apple.com Style Global JavaScript for TechFix Pro
 * Optimized for Apple-like interactions and mobile responsiveness
 */

// ==================================================
// APPLE-STYLE UTILITY FUNCTIONS
// ==================================================

/**
 * Apple's preferred easing function
 */
const APPLE_EASING = 'cubic-bezier(0.4, 0, 0.6, 1)';

/**
 * Debounce with Apple's timing preferences
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time (default 16ms for 60fps)
 * @param {boolean} immediate - Execute immediately
 */
function debounce(func, wait = 16, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Check if device is iOS (Apple's priority platform)
 */
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Check if device supports touch
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get viewport dimensions Apple-style
 */
function getViewport() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 734,
        isTablet: window.innerWidth > 734 && window.innerWidth <= 1067,
        isDesktop: window.innerWidth > 1067
    };
}

/**
 * Apple-style intersection observer
 * @param {Element} element - Element to observe
 * @param {Function} callback - Callback function
 * @param {Object} options - Observer options
 */
function observeElement(element, callback, options = {}) {
    const defaultOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
    };

    const observer = new IntersectionObserver(callback, { ...defaultOptions, ...options });
    observer.observe(element);
    return observer;
}

// ==================================================
// APPLE-STYLE NAVBAR CONTROLLER
// ==================================================

class AppleNavbarController {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navbarToggler = document.querySelector('.navbar-toggler');
        this.navbarCollapse = document.querySelector('.navbar-collapse');
        this.navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        this.body = document.body;

        this.isOpen = false;
        this.scrollThreshold = 44;
        this.lastScrollY = 0;

        this.init();
    }

    init() {
        if (!this.navbar) return;

        this.setupScrollBehavior();
        this.setupMobileMenu();
        this.setupNavLinks();
        this.setupKeyboardNavigation();

        // Bind events with Apple-style timing
        window.addEventListener('scroll', debounce(this.handleScroll.bind(this), 8));
        window.addEventListener('resize', debounce(this.handleResize.bind(this), 100));
    }

    /**
     * Apple-style scroll behavior for navbar
     */
    setupScrollBehavior() {
        const navbar = this.navbar;

        const handleScroll = () => {
            const currentScrollY = window.pageYOffset;
            const viewport = getViewport();

            // Add/remove scrolled class instead of manual styling
            if (currentScrollY > 10) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }

            // Apple-style navbar hide/show on mobile (hapus manual backgroundColor)
            if (viewport.isMobile && !this.isOpen) {
                const scrollDelta = currentScrollY - this.lastScrollY;

                if (scrollDelta > 5 && currentScrollY > this.scrollThreshold) {
                    navbar.style.transform = 'translateY(-100%)';
                    navbar.style.transition = `transform 0.3s ${APPLE_EASING}`;
                } else if (scrollDelta < -5) {
                    navbar.style.transform = 'translateY(0)';
                    navbar.style.transition = `transform 0.3s ${APPLE_EASING}`;
                }
            }

            this.lastScrollY = currentScrollY;
        };

        this.handleScroll = handleScroll;
    }

    /**
     * Apple-style mobile menu behavior
     */
    setupMobileMenu() {
        if (!this.navbarToggler) return;

        this.navbarToggler.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileMenu();
        });

        // Close menu when clicking outside (Apple behavior)
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.isOpen) {
                    this.updateMobileMenuHeight();
                }
            }, 100);
        });
    }

    /**
     * Toggle mobile menu with Apple-style animation
     */
    toggleMobileMenu() {
        if (this.isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu Apple-style
     */
    openMobileMenu() {
        this.isOpen = true;
        this.navbarCollapse.classList.add('show');
        this.body.classList.add('menu-open');

        // Prevent scroll on iOS
        if (isIOS()) {
            this.body.style.position = 'fixed';
            this.body.style.width = '100%';
            this.body.style.top = `-${window.pageYOffset}px`;
        }

        // Apple-style animation
        this.navbarCollapse.style.opacity = '0';
        this.navbarCollapse.style.transform = 'translateY(-20px)';

        requestAnimationFrame(() => {
            this.navbarCollapse.style.transition = `all 0.3s ${APPLE_EASING}`;
            this.navbarCollapse.style.opacity = '1';
            this.navbarCollapse.style.transform = 'translateY(0)';
        });

        // Focus first menu item for accessibility
        const firstLink = this.navbarCollapse.querySelector('.nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }
    }

    /**
     * Close mobile menu Apple-style
     */
    closeMobileMenu() {
        this.isOpen = false;

        // Restore scroll on iOS
        if (isIOS()) {
            const scrollY = this.body.style.top;
            this.body.style.position = '';
            this.body.style.width = '';
            this.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }

        this.body.classList.remove('menu-open');

        // Apple-style close animation
        this.navbarCollapse.style.transition = `all 0.2s ${APPLE_EASING}`;
        this.navbarCollapse.style.opacity = '0';
        this.navbarCollapse.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            this.navbarCollapse.classList.remove('show');
            this.navbarCollapse.style.transition = '';
            this.navbarCollapse.style.opacity = '';
            this.navbarCollapse.style.transform = '';
        }, 200);
    }

    /**
     * Setup navigation links with Apple behavior
     */
    setupNavLinks() {
        this.navLinks.forEach(link => {
            // Apple-style hover effects
            link.addEventListener('mouseenter', () => {
                if (!isTouchDevice()) {
                    link.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                    link.style.transition = `background-color 0.2s ${APPLE_EASING}`;
                }
            });

            link.addEventListener('mouseleave', () => {
                if (!isTouchDevice()) {
                    link.style.backgroundColor = '';
                }
            });

            // Handle anchor links
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        this.scrollToSection(targetElement);

                        // Close mobile menu if open
                        if (this.isOpen) {
                            this.closeMobileMenu();
                        }
                    }
                }
            });
        });
    }

    /**
     * Apple-style smooth scrolling
     * @param {Element} targetElement - Element to scroll to
     */
    scrollToSection(targetElement) {
        const navbarHeight = this.navbar.offsetHeight;
        const targetPosition = targetElement.offsetTop - navbarHeight;

        // Use Apple's preferred easing
        if (CSS.supports('scroll-behavior', 'smooth')) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback animation with Apple easing
            this.animateScroll(targetPosition, 600);
        }
    }

    /**
     * Custom scroll animation with Apple easing
     * @param {number} targetPosition - Target scroll position
     * @param {number} duration - Animation duration
     */
    animateScroll(targetPosition, duration = 600) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Apple's cubic-bezier easing
            const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    /**
     * Setup keyboard navigation (Apple accessibility)
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes menu
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMobileMenu();
            }

            // Tab navigation in mobile menu
            if (e.key === 'Tab' && this.isOpen) {
                this.handleTabNavigation(e);
            }
        });
    }

    /**
     * Handle tab navigation in mobile menu
     * @param {Event} e - Keyboard event
     */
    handleTabNavigation(e) {
        const focusableElements = this.navbarCollapse.querySelectorAll(
            'a[href], button:not([disabled])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const viewport = getViewport();

        // Close mobile menu on resize to desktop
        if (viewport.isDesktop && this.isOpen) {
            this.closeMobileMenu();
        }

        // Reset navbar transform on resize
        if (viewport.isDesktop) {
            this.navbar.style.transform = 'translateY(0)';
        }
    }
}

// ==================================================
// APPLE-STYLE SCROLL CONTROLLER
// ==================================================

class AppleScrollController {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupScrollIndicators();
    }

    /**
     * Setup Apple-style smooth scrolling for all anchor links
     */
    setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (href === '#' || href === '#top') {
                e.preventDefault();
                this.scrollToTop();
                return;
            }

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();
                this.scrollToElement(targetElement);
            }
        });
    }

    /**
     * Scroll to element with Apple-style animation
     * @param {Element} element - Target element
     */
    scrollToElement(element) {
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 44;
        const targetPosition = element.offsetTop - navbarHeight;

        this.animateScroll(targetPosition);
    }

    /**
     * Scroll to top Apple-style
     */
    scrollToTop() {
        this.animateScroll(0);
    }

    /**
     * Apple-style scroll animation
     * @param {number} targetPosition - Target scroll position
     */
    animateScroll(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = Math.min(Math.abs(distance) * 0.5, 800); // Dynamic duration
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Apple's smooth easing
            const ease = 1 - Math.pow(1 - progress, 3);

            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    /**
     * Setup scroll indicators (like Apple's scroll hints)
     */
    setupScrollIndicators() {
        const indicators = document.querySelectorAll('.hero-scroll-indicator');

        indicators.forEach(indicator => {
            // Hide indicator when user scrolls
            const hideIndicator = debounce(() => {
                if (window.pageYOffset > 100) {
                    indicator.style.opacity = '0';
                    indicator.style.pointerEvents = 'none';
                } else {
                    indicator.style.opacity = '0.6';
                    indicator.style.pointerEvents = 'auto';
                }
            }, 50);

            window.addEventListener('scroll', hideIndicator);
        });
    }
}

// ==================================================
// APPLE-STYLE TOUCH GESTURES
// ==================================================

class AppleTouchController {
    constructor() {
        this.isTouch = isTouchDevice();
        this.isIOS = isIOS();

        if (this.isTouch) {
            this.init();
        }
    }

    init() {
        this.setupTouchFeedback();
        this.setupIOSOptimizations();
    }

    /**
     * Add Apple-style touch feedback
     */
    setupTouchFeedback() {
        const touchElements = document.querySelectorAll('.btn, .nav-link, .card');

        touchElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.97)';
                element.style.transition = `transform 0.1s ${APPLE_EASING}`;
            }, { passive: true });

            element.addEventListener('touchend', () => {
                element.style.transform = 'scale(1)';
            }, { passive: true });

            element.addEventListener('touchcancel', () => {
                element.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }

    /**
     * iOS-specific optimizations
     */
    setupIOSOptimizations() {
        if (!this.isIOS) return;

        // Prevent zoom on input focus
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content',
                        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
                    );
                }
            });

            input.addEventListener('blur', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content',
                        'width=device-width, initial-scale=1'
                    );
                }
            });
        });

        // Fix iOS scroll momentum
        document.body.style.webkitOverflowScrolling = 'touch';
    }
}

// ==================================================
// APPLE-STYLE LAZY LOADING
// ==================================================

class AppleLazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            this.loadAllImages();
        }
    }

    /**
     * Setup Apple-optimized intersection observer
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px 0px',
            threshold: 0.01
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.images.forEach(img => observer.observe(img));
    }

    /**
     * Load image with Apple-style fade-in
     * @param {Element} img - Image element
     */
    loadImage(img) {
        img.style.opacity = '0';
        img.style.transition = `opacity 0.3s ${APPLE_EASING}`;

        const imageLoader = new Image();
        imageLoader.onload = () => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }

            img.style.opacity = '1';
            img.classList.add('loaded');
        };

        imageLoader.onerror = () => {
            img.style.opacity = '1';
            img.classList.add('error');
        };

        imageLoader.src = img.dataset.src || img.src;
    }

    /**
     * Fallback: load all images immediately
     */
    loadAllImages() {
        this.images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }
}

// ==================================================
// INITIALIZATION WITH APPLE TIMING
// ==================================================

/**
 * Initialize all Apple-style controllers
 */
function initializeAppleGlobal() {
    // Initialize controllers with Apple timing
    const controllers = [
        () => new AppleNavbarController(),
        () => new AppleScrollController(),
        () => new AppleTouchController(),
        () => new AppleLazyLoader()
    ];

    controllers.forEach((initController, index) => {
        setTimeout(initController, index * 50); // Staggered initialization
    });

    // Mark as initialized
    document.body.classList.add('apple-global-loaded');
    document.dispatchEvent(new CustomEvent('appleGlobalLoaded'));

    console.log('🍎 Apple-style global scripts initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppleGlobal);
} else {
    initializeAppleGlobal();
}

// Export for module usage
window.AppleGlobal = {
    debounce,
    isIOS,
    isTouchDevice,
    getViewport,
    observeElement,
    APPLE_EASING,
    AppleNavbarController,
    AppleScrollController,
    AppleTouchController,
    AppleLazyLoader
};

// global.js end