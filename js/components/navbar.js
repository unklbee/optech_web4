// js/components/navbar.js

import { debounce, APPLE_EASING } from '../core/utils.js';
import { isIOS, isTouchDevice, getViewport } from '../core/device.js';
import { addEvent, $, $$ } from '../core/dom.js';
import { scrollToElement } from '../core/animation.js';
import { AppleMegaMenu } from './mega-menu.js';

/**
 * Apple-style Navbar Component
 * Provides smooth scrolling, mobile menu, and Apple-like interactions
 */
export class AppleNavbar {
    constructor(selector = '.navbar', options = {}) {
        this.navbar = $(selector);
        if (!this.navbar) {
            console.warn(`Navbar element not found: ${selector}`);
            return;
        }

        this.options = {
            scrollThreshold: 44,
            mobileBreakpoint: 734,
            hideOnScroll: true,
            smoothScroll: true,
            ...options
        };

        this.state = {
            isOpen: false,
            isScrolled: false,
            lastScrollY: 0,
            isVisible: true
        };

        this.elements = this.cacheElements();
        this.cleanupFunctions = [];

        this.init();

        // Initialize mega menu if apple-navbar class is present
        if (this.navbar.classList.contains('apple-navbar')) {
            this.megaMenu = new AppleMegaMenu(selector, options.megaMenuOptions);
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        return {
            toggler: $('.navbar-toggler', this.navbar),
            collapse: $('.navbar-collapse', this.navbar),
            navLinks: $$('.navbar-nav .nav-link', this.navbar),
            brand: $('.navbar-brand', this.navbar)
        };
    }

    /**
     * Initialize navbar
     */
    init() {
        this.setupScrollBehavior();
        this.setupMobileMenu();
        this.setupNavigation();
        this.setupKeyboardNavigation();
        this.setupEventListeners();

        console.log('🍎 Apple Navbar initialized');
    }

    /**
     * Setup scroll behavior
     */
    setupScrollBehavior() {
        const handleScroll = debounce(() => {
            const currentScrollY = window.pageYOffset;
            const viewport = getViewport();

            // Update scroll state
            this.state.isScrolled = currentScrollY > 10;
            this.navbar.classList.toggle('navbar-scrolled', this.state.isScrolled);

            // Hide/show navbar on mobile
            if (viewport.isMobile && this.options.hideOnScroll && !this.state.isOpen) {
                const scrollDelta = currentScrollY - this.state.lastScrollY;

                if (scrollDelta > 5 && currentScrollY > this.options.scrollThreshold) {
                    this.hideNavbar();
                } else if (scrollDelta < -5) {
                    this.showNavbar();
                }
            }

            this.state.lastScrollY = currentScrollY;
        }, 8);

        this.cleanupFunctions.push(
            addEvent(window, 'scroll', handleScroll, { passive: true })
        );
    }

    /**
     * Setup mobile menu
     */
    setupMobileMenu() {
        if (!this.elements.toggler || !this.elements.collapse) return;

        // Toggle button click
        this.cleanupFunctions.push(
            addEvent(this.elements.toggler, 'click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            })
        );

        // Close menu on outside click
        this.cleanupFunctions.push(
            addEvent(document, 'click', (e) => {
                if (this.state.isOpen && !this.navbar.contains(e.target)) {
                    this.closeMobileMenu();
                }
            })
        );

        // Handle orientation change
        this.cleanupFunctions.push(
            addEvent(window, 'orientationchange', () => {
                setTimeout(() => {
                    if (this.state.isOpen) {
                        this.updateMobileMenuHeight();
                    }
                }, 100);
            })
        );
    }

    /**
     * Setup navigation links
     */
    setupNavigation() {
        this.elements.navLinks.forEach(link => {
            // Hover effects for desktop
            if (!isTouchDevice()) {
                this.cleanupFunctions.push(
                    addEvent(link, 'mouseenter', () => {
                        link.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                        link.style.transition = `background-color 0.2s ${APPLE_EASING}`;
                    })
                );

                this.cleanupFunctions.push(
                    addEvent(link, 'mouseleave', () => {
                        link.style.backgroundColor = '';
                    })
                );
            }

            // Handle anchor link clicks
            this.cleanupFunctions.push(
                addEvent(link, 'click', (e) => {
                    const href = link.getAttribute('href');

                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        this.handleAnchorClick(href);
                    }
                })
            );
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        this.cleanupFunctions.push(
            addEvent(document, 'keydown', (e) => {
                // Escape key closes menu
                if (e.key === 'Escape' && this.state.isOpen) {
                    this.closeMobileMenu();
                }

                // Tab navigation in mobile menu
                if (e.key === 'Tab' && this.state.isOpen) {
                    this.handleTabNavigation(e);
                }
            })
        );
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Resize handler
        const handleResize = debounce(() => {
            const viewport = getViewport();

            // Close mobile menu on resize to desktop
            if (viewport.isDesktop && this.state.isOpen) {
                this.closeMobileMenu();
            }

            // Reset navbar transform on resize
            if (viewport.isDesktop) {
                this.showNavbar();
            }
        }, 100);

        this.cleanupFunctions.push(
            addEvent(window, 'resize', handleResize)
        );
    }

    /**
     * Handle anchor link clicks
     */
    handleAnchorClick(href) {
        const targetId = href.substring(1);

        if (targetId === '' || targetId === 'top') {
            this.scrollToTop();
        } else {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                this.scrollToElement(targetElement);
            }
        }

        // Close mobile menu if open
        if (this.state.isOpen) {
            this.closeMobileMenu();
        }
    }

    /**
     * Scroll to element with navbar offset
     */
    scrollToElement(element) {
        const navbarHeight = this.navbar.offsetHeight;
        const offset = -navbarHeight;

        if (this.options.smoothScroll) {
            scrollToElement(element, { offset });
        } else {
            const targetPosition = element.offsetTop + offset;
            window.scrollTo(0, targetPosition);
        }
    }

    /**
     * Scroll to top
     */
    scrollToTop() {
        if (this.options.smoothScroll) {
            scrollToElement(document.body);
        } else {
            window.scrollTo(0, 0);
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.state.isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu with Apple-style animation
     */
    openMobileMenu() {
        this.state.isOpen = true;
        this.elements.collapse.classList.add('show');
        document.body.classList.add('menu-open');

        // Prevent scroll on iOS
        if (isIOS()) {
            this.preventBodyScroll();
        }

        // Apple-style animation
        this.elements.collapse.style.opacity = '0';
        this.elements.collapse.style.transform = 'translateY(-20px)';

        requestAnimationFrame(() => {
            this.elements.collapse.style.transition = `all 0.3s ${APPLE_EASING}`;
            this.elements.collapse.style.opacity = '1';
            this.elements.collapse.style.transform = 'translateY(0)';
        });

        // Focus first menu item for accessibility
        const firstLink = this.elements.collapse.querySelector('.nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }

        // Update ARIA attributes
        this.elements.toggler.setAttribute('aria-expanded', 'true');
    }

    /**
     * Close mobile menu with Apple-style animation
     */
    closeMobileMenu() {
        this.state.isOpen = false;

        // Restore scroll on iOS
        if (isIOS()) {
            this.restoreBodyScroll();
        }

        document.body.classList.remove('menu-open');

        // Apple-style close animation
        this.elements.collapse.style.transition = `all 0.2s ${APPLE_EASING}`;
        this.elements.collapse.style.opacity = '0';
        this.elements.collapse.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            this.elements.collapse.classList.remove('show');
            this.elements.collapse.style.transition = '';
            this.elements.collapse.style.opacity = '';
            this.elements.collapse.style.transform = '';
        }, 200);

        // Update ARIA attributes
        this.elements.toggler.setAttribute('aria-expanded', 'false');
    }

    /**
     * Handle tab navigation in mobile menu
     */
    handleTabNavigation(e) {
        const focusableElements = this.elements.collapse.querySelectorAll(
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
     * Hide navbar (mobile)
     */
    hideNavbar() {
        if (this.state.isVisible) {
            this.state.isVisible = false;
            this.navbar.style.transform = 'translateY(-100%)';
            this.navbar.style.transition = `transform 0.3s ${APPLE_EASING}`;
        }
    }

    /**
     * Show navbar (mobile)
     */
    showNavbar() {
        if (!this.state.isVisible) {
            this.state.isVisible = true;
            this.navbar.style.transform = 'translateY(0)';
            this.navbar.style.transition = `transform 0.3s ${APPLE_EASING}`;
        }
    }

    /**
     * Prevent body scroll (iOS)
     */
    preventBodyScroll() {
        this.scrollPosition = window.pageYOffset;
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${this.scrollPosition}px`;
    }

    /**
     * Restore body scroll (iOS)
     */
    restoreBodyScroll() {
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, this.scrollPosition || 0);
    }

    /**
     * Update mobile menu height
     */
    updateMobileMenuHeight() {
        if (this.state.isOpen) {
            // Recalculate menu height if needed
            // This is useful for orientation changes
        }
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Update options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Destroy navbar instance
     */
    destroy() {
        // Clean up event listeners
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];

        // Remove classes
        document.body.classList.remove('menu-open');
        this.navbar.classList.remove('navbar-scrolled');

        // Reset styles
        this.navbar.style.transform = '';
        this.navbar.style.transition = '';

        if (this.elements.collapse) {
            this.elements.collapse.style.opacity = '';
            this.elements.collapse.style.transform = '';
            this.elements.collapse.style.transition = '';
        }

        // Restore body scroll if needed
        if (isIOS() && this.state.isOpen) {
            this.restoreBodyScroll();
        }

        // Clean up mega menu
        if (this.megaMenu) {
            this.megaMenu.destroy();
        }

        console.log('🍎 Apple Navbar destroyed');
    }
}

/**
 * Auto-initialize navbar on DOM ready
 */
export function initNavbar(selector = '.navbar', options = {}) {
    return new AppleNavbar(selector, options);
}

/**
 * Factory function for creating multiple navbars
 */
export function createNavbars(selectors = ['.navbar'], options = {}) {
    return selectors.map(selector => new AppleNavbar(selector, options));
}