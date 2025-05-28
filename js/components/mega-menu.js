// js/components/mega-menu.js

import { debounce, APPLE_EASING } from '../core/utils.js';
import { isIOS, isTouchDevice, getViewport } from '../core/device.js';
import { addEvent, $, $$, setStyles, createElement } from '../core/dom.js';
import { fadeIn, fadeOut, slideDown, slideUp } from '../core/animation.js';

/**
 * Apple-style Mega Menu Component
 * Mobile-First & Responsive Design with Apple animations
 */
export class AppleMegaMenu {
    constructor(selector = '.apple-navbar', options = {}) {
        this.navbar = $(selector);
        if (!this.navbar) {
            console.warn(`Mega menu navbar not found: ${selector}`);
            return;
        }

        this.options = {
            mobileBreakpoint: 735,
            animationDuration: 300,
            backdropOpacity: 0.1,
            hoverDelay: 100,
            ...options
        };

        this.state = {
            activeMenu: null,
            isMobileMenuOpen: false,
            isDesktop: window.innerWidth >= this.options.mobileBreakpoint,
            openSubmenus: new Set(),
            scrollPosition: 0
        };

        this.elements = this.cacheElements();
        this.cleanupFunctions = [];

        this.init();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        return {
            megaMenuTriggers: $$('[data-mega-menu]', this.navbar),
            megaMenus: $$('.apple-mega-menu'),
            mobileToggle: $('.apple-navbar-toggle', this.navbar),
            mobileMenu: $('.apple-mobile-menu'),
            mobileNavItems: $$('.apple-mobile-nav-item.has-submenu'),
            backdrop: null
        };
    }

    /**
     * Initialize mega menu
     */
    init() {
        this.setupDesktopMegaMenu();
        this.setupMobileMenu();
        this.setupEventListeners();
        this.setupAccessibility();

        console.log('🍎 Apple Mega Menu initialized');
    }

    /**
     * Setup desktop mega menu functionality
     */
    setupDesktopMegaMenu() {
        this.elements.megaMenuTriggers.forEach(trigger => {
            const menuId = trigger.getAttribute('data-mega-menu');
            const megaMenu = $(`#mega-menu-${menuId}`);

            if (!megaMenu) {
                console.warn(`Mega menu not found: mega-menu-${menuId}`);
                return;
            }

            // Hover events for desktop
            this.cleanupFunctions.push(
                addEvent(trigger, 'mouseenter', () => {
                    if (this.state.isDesktop) {
                        this.openMegaMenu(megaMenu, trigger);
                    }
                })
            );

            // Keep menu open when hovering over it
            this.cleanupFunctions.push(
                addEvent(megaMenu, 'mouseenter', () => {
                    if (this.state.isDesktop) {
                        this.openMegaMenu(megaMenu, trigger);
                    }
                })
            );

            // Close menu when leaving trigger
            this.cleanupFunctions.push(
                addEvent(trigger, 'mouseleave', () => {
                    if (this.state.isDesktop) {
                        this.scheduleClose(megaMenu, trigger);
                    }
                })
            );

            // Close menu when leaving menu
            this.cleanupFunctions.push(
                addEvent(megaMenu, 'mouseleave', () => {
                    if (this.state.isDesktop) {
                        this.scheduleClose(megaMenu, trigger);
                    }
                })
            );

            // Click handling for mobile fallback
            this.cleanupFunctions.push(
                addEvent(trigger, 'click', (e) => {
                    if (!this.state.isDesktop) {
                        e.preventDefault();
                        this.toggleMobileMenu();
                    }
                })
            );
        });
    }

    /**
     * Schedule menu close with delay for better UX
     */
    scheduleClose(megaMenu, trigger) {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = setTimeout(() => {
            if (!megaMenu.matches(':hover') && !trigger.matches(':hover')) {
                this.closeMegaMenu(megaMenu, trigger);
            }
        }, this.options.hoverDelay);
    }

    /**
     * Open mega menu with Apple-style animation
     */
    async openMegaMenu(megaMenu, trigger) {
        // Close any other open menus
        this.closeAllMegaMenus();

        // Clear any pending close timeouts
        clearTimeout(this.closeTimeout);

        // Set active state
        this.state.activeMenu = megaMenu;
        trigger.setAttribute('aria-expanded', 'true');

        // Add backdrop
        this.addMegaMenuBackdrop();

        // Animate menu opening
        setStyles(megaMenu, {
            display: 'block',
            opacity: '0',
            transform: 'translateY(-10px)'
        });

        megaMenu.classList.add('active');

        // Use animation system for smooth opening
        await fadeIn(megaMenu, {
            duration: this.options.animationDuration,
            easing: 'apple'
        });

        setStyles(megaMenu, {
            transform: 'translateY(0)'
        });
    }

    /**
     * Close mega menu with Apple-style animation
     */
    async closeMegaMenu(megaMenu, trigger) {
        if (!megaMenu.classList.contains('active')) return;

        trigger.setAttribute('aria-expanded', 'false');

        // Animate menu closing
        await fadeOut(megaMenu, {
            duration: this.options.animationDuration / 2,
            easing: 'apple'
        });

        megaMenu.classList.remove('active');
        setStyles(megaMenu, {
            display: '',
            opacity: '',
            transform: ''
        });

        if (this.state.activeMenu === megaMenu) {
            this.state.activeMenu = null;
            this.removeMegaMenuBackdrop();
        }
    }

    /**
     * Close all mega menus
     */
    closeAllMegaMenus() {
        this.elements.megaMenus.forEach(menu => {
            if (menu.classList.contains('active')) {
                const trigger = $(`[data-mega-menu="${menu.id.replace('mega-menu-', '')}"]`);
                if (trigger) {
                    this.closeMegaMenu(menu, trigger);
                }
            }
        });
    }

    /**
     * Add backdrop behind mega menu
     */
    addMegaMenuBackdrop() {
        if (this.elements.backdrop) return;

        this.elements.backdrop = createElement('div', {
            className: 'mega-menu-backdrop',
            styles: {
                position: 'fixed',
                top: '44px',
                left: '0',
                right: '0',
                bottom: '0',
                background: `rgba(0, 0, 0, ${this.options.backdropOpacity})`,
                zIndex: '9996',
                opacity: '0',
                transition: `opacity ${this.options.animationDuration}ms ${APPLE_EASING}`
            }
        });

        document.body.appendChild(this.elements.backdrop);

        // Fade in backdrop
        requestAnimationFrame(() => {
            setStyles(this.elements.backdrop, { opacity: '1' });
        });

        // Close menu when clicking backdrop
        this.cleanupFunctions.push(
            addEvent(this.elements.backdrop, 'click', () => {
                this.closeAllMegaMenus();
            })
        );
    }

    /**
     * Remove backdrop
     */
    removeMegaMenuBackdrop() {
        if (!this.elements.backdrop) return;

        setStyles(this.elements.backdrop, { opacity: '0' });

        setTimeout(() => {
            if (this.elements.backdrop && this.elements.backdrop.parentNode) {
                this.elements.backdrop.parentNode.removeChild(this.elements.backdrop);
                this.elements.backdrop = null;
            }
        }, this.options.animationDuration);
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        if (!this.elements.mobileToggle) return;

        // Toggle button click
        this.cleanupFunctions.push(
            addEvent(this.elements.mobileToggle, 'click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            })
        );

        // Setup mobile submenu toggles
        this.elements.mobileNavItems.forEach(item => {
            const trigger = $('.apple-mobile-nav-link', item);
            if (trigger) {
                this.cleanupFunctions.push(
                    addEvent(trigger, 'click', (e) => {
                        e.preventDefault();
                        this.toggleMobileSubmenu(item);
                    })
                );
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.state.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    async openMobileMenu() {
        if (!this.elements.mobileMenu || !this.elements.mobileToggle) return;

        this.state.isMobileMenuOpen = true;
        this.state.scrollPosition = window.pageYOffset;

        // Update toggle state
        this.elements.mobileToggle.classList.add('active');
        this.elements.mobileToggle.setAttribute('aria-expanded', 'true');

        // Prevent body scroll (iOS-safe)
        this.preventBodyScroll();

        // Animate menu opening
        setStyles(this.elements.mobileMenu, {
            display: 'block',
            transform: 'translateY(-100%)'
        });

        this.elements.mobileMenu.classList.add('active');

        // Smooth slide down animation
        await slideDown(this.elements.mobileMenu, {
            duration: 400,
            easing: 'apple'
        });

        setStyles(this.elements.mobileMenu, {
            transform: 'translateY(0)'
        });

        // Focus first menu item for accessibility
        const firstLink = $('.apple-mobile-nav-link', this.elements.mobileMenu);
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    /**
     * Close mobile menu
     */
    async closeMobileMenu() {
        if (!this.elements.mobileMenu || !this.elements.mobileToggle) return;

        this.state.isMobileMenuOpen = false;

        // Update toggle state
        this.elements.mobileToggle.classList.remove('active');
        this.elements.mobileToggle.setAttribute('aria-expanded', 'false');

        // Animate menu closing
        await slideUp(this.elements.mobileMenu, {
            duration: 300,
            easing: 'apple'
        });

        this.elements.mobileMenu.classList.remove('active');
        setStyles(this.elements.mobileMenu, {
            display: '',
            transform: ''
        });

        // Restore body scroll
        this.restoreBodyScroll();

        // Close all open submenus
        this.closeAllMobileSubmenus();
    }

    /**
     * Toggle mobile submenu
     */
    async toggleMobileSubmenu(item) {
        const submenu = $('.apple-mobile-submenu', item);
        const trigger = $('.apple-mobile-nav-link', item);
        const isActive = item.classList.contains('active');

        if (isActive) {
            // Close submenu
            item.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
            this.state.openSubmenus.delete(item);

            await slideUp(submenu, {
                duration: 300,
                easing: 'apple'
            });
        } else {
            // Open submenu
            item.classList.add('active');
            trigger.setAttribute('aria-expanded', 'true');
            this.state.openSubmenus.add(item);

            await slideDown(submenu, {
                duration: 300,
                easing: 'apple'
            });
        }
    }

    /**
     * Close all mobile submenus
     */
    closeAllMobileSubmenus() {
        this.state.openSubmenus.forEach(item => {
            item.classList.remove('active');
            const trigger = $('.apple-mobile-nav-link', item);
            if (trigger) {
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
        this.state.openSubmenus.clear();
    }

    /**
     * Prevent body scroll for mobile menu
     */
    preventBodyScroll() {
        if (isIOS()) {
            // iOS-specific scroll prevention
            setStyles(document.body, {
                position: 'fixed',
                width: '100%',
                top: `-${this.state.scrollPosition}px`
            });
        } else {
            // Standard scroll prevention
            setStyles(document.body, {
                overflow: 'hidden'
            });
        }
    }

    /**
     * Restore body scroll
     */
    restoreBodyScroll() {
        if (isIOS()) {
            // iOS-specific scroll restoration
            setStyles(document.body, {
                position: '',
                width: '',
                top: ''
            });
            window.scrollTo(0, this.state.scrollPosition);
        } else {
            // Standard scroll restoration
            setStyles(document.body, {
                overflow: ''
            });
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle viewport changes
        const handleResize = debounce(() => {
            const wasDesktop = this.state.isDesktop;
            this.state.isDesktop = window.innerWidth >= this.options.mobileBreakpoint;

            // Close menus when switching between mobile/desktop
            if (wasDesktop !== this.state.isDesktop) {
                this.closeAllMegaMenus();
                this.closeMobileMenu();
            }
        }, 100);

        this.cleanupFunctions.push(
            addEvent(window, 'resize', handleResize)
        );

        // Handle orientation change
        this.cleanupFunctions.push(
            addEvent(window, 'orientationchange', () => {
                setTimeout(() => {
                    handleResize();
                    if (this.state.isMobileMenuOpen) {
                        // Recalculate menu height after orientation change
                        this.updateMobileMenuHeight();
                    }
                }, 100);
            })
        );

        // Escape key handling
        this.cleanupFunctions.push(
            addEvent(document, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAllMegaMenus();
                    this.closeMobileMenu();
                }
            })
        );

        // Click outside handling
        this.cleanupFunctions.push(
            addEvent(document, 'click', (e) => {
                const isMenuClick = e.target.closest('.apple-mega-menu, [data-mega-menu]');
                const isMobileMenuClick = e.target.closest('.apple-mobile-menu, .apple-navbar-toggle');

                if (!isMenuClick && this.state.activeMenu) {
                    this.closeAllMegaMenus();
                }

                if (!isMobileMenuClick && this.state.isMobileMenuOpen) {
                    this.closeMobileMenu();
                }
            })
        );
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Arrow key navigation in mega menus
        this.elements.megaMenus.forEach(menu => {
            this.cleanupFunctions.push(
                addEvent(menu, 'keydown', (e) => {
                    this.handleMegaMenuKeyNavigation(e, menu);
                })
            );
        });

        // Tab navigation in mobile menu
        if (this.elements.mobileMenu) {
            this.cleanupFunctions.push(
                addEvent(this.elements.mobileMenu, 'keydown', (e) => {
                    this.handleMobileMenuKeyNavigation(e);
                })
            );
        }
    }

    /**
     * Handle keyboard navigation in mega menu
     */
    handleMegaMenuKeyNavigation(e, menu) {
        const focusableElements = $$('a[href], button:not([disabled])', menu);
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % focusableElements.length;
                focusableElements[nextIndex]?.focus();
                break;

            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                focusableElements[prevIndex]?.focus();
                break;

            case 'Home':
                e.preventDefault();
                focusableElements[0]?.focus();
                break;

            case 'End':
                e.preventDefault();
                focusableElements[focusableElements.length - 1]?.focus();
                break;
        }
    }

    /**
     * Handle keyboard navigation in mobile menu
     */
    handleMobileMenuKeyNavigation(e) {
        if (e.key === 'Tab') {
            const focusableElements = $$('a[href], button:not([disabled])', this.elements.mobileMenu);
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
            }
        }
    }

    /**
     * Update mobile menu height (for orientation changes)
     */
    updateMobileMenuHeight() {
        if (this.elements.mobileMenu && this.state.isMobileMenuOpen) {
            // Force recalculation of menu height
            setStyles(this.elements.mobileMenu, {
                height: 'auto'
            });
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
     * Destroy mega menu instance
     */
    destroy() {
        // Clean up event listeners
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];

        // Close all menus
        this.closeAllMegaMenus();
        this.closeMobileMenu();

        // Remove backdrop
        this.removeMegaMenuBackdrop();

        // Restore body scroll if needed
        if (this.state.isMobileMenuOpen) {
            this.restoreBodyScroll();
        }

        // Clear timeouts
        clearTimeout(this.closeTimeout);

        console.log('🍎 Apple Mega Menu destroyed');
    }
}

/**
 * Auto-initialize mega menu
 */
export function initMegaMenu(selector = '.apple-navbar', options = {}) {
    return new AppleMegaMenu(selector, options);
}

/**
 * Factory function for creating multiple mega menus
 */
export function createMegaMenus(selectors = ['.apple-navbar'], options = {}) {
    return selectors.map(selector => new AppleMegaMenu(selector, options));
}