// Apple Theme Controller - Fixed Initialization Order
class AppleThemeController {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            storageKey: 'techfix-pro-theme',
            transitionDuration: 300,
            rippleColor: 'rgba(0, 0, 0, 0.1)',
            easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
            ...options
        };

        // Initialize media query FIRST
        this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        // Then get stored theme (now prefersDark is available)
        this.currentTheme = this.getStoredTheme();

        // Initialize other properties
        this.toggleButton = null;

        // Theme colors mapping
        this.themeColors = {
            light: {
                primary: '#f5f5f7',
                text: '#1d1d1f',
                navbar: 'rgba(255, 255, 255, 0.95)',
                navbarScrolled: 'rgba(255, 255, 255, 0.95)',
                hover: 'rgba(0, 0, 0, 0.04)'
            },
            dark: {
                primary: '#000000',
                text: '#f5f5f7',
                navbar: 'rgba(0, 0, 0, 0.8)',
                navbarScrolled: 'rgba(0, 0, 0, 0.95)',
                hover: 'rgba(255, 255, 255, 0.08)'
            }
        };

        this.init();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    init() {
        try {
            this.createToggleButton();
            this.applyTheme(this.currentTheme, false); // No transition on init
            this.setupEventListeners();
            this.setupSystemThemeListener();
            this.injectStyles();
        } catch (error) {
            console.error('Error initializing Apple Theme Controller:', error);
        }
    }

    getStoredTheme() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (stored && ['light', 'dark'].includes(stored)) {
                return stored;
            }
        } catch (error) {
            console.warn('Could not access localStorage:', error);
        }

        // Fallback to system preference
        try {
            return this.prefersDark && this.prefersDark.matches ? 'dark' : 'light';
        } catch (error) {
            console.warn('Could not access media query:', error);
            return 'light'; // Final fallback
        }
    }

    // ==========================================
    // UI CREATION (DRY)
    // ==========================================

    createToggleButton() {
        try {
            this.toggleButton = this.createElement('button', {
                className: 'theme-toggle nav-link',
                attributes: {
                    'aria-label': this.getAriaLabel(),
                    'title': 'Toggle appearance',
                    'type': 'button'
                },
                styles: {
                    background: 'none',
                    border: 'none',
                    padding: '0 10px',
                    margin: '0 4px',
                    borderRadius: '18px',
                    transition: `background-color 0.3s ${this.config.easing}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '36px',
                    minWidth: '36px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                },
                innerHTML: this.getToggleIcon()
            });

            this.insertToggleButton();
            this.setupButtonEffects();
        } catch (error) {
            console.error('Error creating toggle button:', error);
        }
    }

    createElement(tag, config) {
        const element = document.createElement(tag);

        try {
            if (config.className) element.className = config.className;
            if (config.innerHTML) element.innerHTML = config.innerHTML;

            if (config.attributes) {
                Object.entries(config.attributes).forEach(([key, value]) => {
                    element.setAttribute(key, value);
                });
            }

            if (config.styles) {
                Object.entries(config.styles).forEach(([key, value]) => {
                    element.style[key] = value;
                });
            }
        } catch (error) {
            console.error('Error configuring element:', error);
        }

        return element;
    }

    insertToggleButton() {
        try {
            const navbar = document.querySelector('.navbar-nav');
            if (!navbar) {
                console.warn('Navbar not found, toggle button not inserted');
                return;
            }

            const lastNavItem = navbar.lastElementChild;
            if (lastNavItem) {
                navbar.insertBefore(this.toggleButton, lastNavItem);
            } else {
                navbar.appendChild(this.toggleButton);
            }
        } catch (error) {
            console.error('Error inserting toggle button:', error);
        }
    }

    // ==========================================
    // THEME ICONS (DRY)
    // ==========================================

    getToggleIcon() {
        const icons = {
            dark: `<svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
            </svg>`,
            light: `<svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
            </svg>`
        };

        return icons[this.currentTheme] || icons.light;
    }

    getAriaLabel() {
        return this.currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }

    // ==========================================
    // BUTTON EFFECTS (DRY)
    // ==========================================

    setupButtonEffects() {
        if (!this.toggleButton) return;

        const effects = {
            mouseenter: () => !this.isTouchDevice() && this.setButtonBackground(true),
            mouseleave: () => !this.isTouchDevice() && this.setButtonBackground(false),
            touchstart: () => this.isTouchDevice() && this.handleTouchStart(),
            touchend: () => this.isTouchDevice() && this.handleTouchEnd(),
            click: (e) => this.handleClick(e),
            keydown: (e) => this.handleKeydown(e)
        };

        Object.entries(effects).forEach(([event, handler]) => {
            try {
                this.toggleButton.addEventListener(event, handler,
                    event.startsWith('touch') ? { passive: true } : false
                );
            } catch (error) {
                console.error(`Error adding ${event} listener:`, error);
            }
        });
    }

    setButtonBackground(isHover) {
        if (!this.toggleButton) return;

        try {
            const colors = this.themeColors[this.currentTheme];
            this.toggleButton.style.backgroundColor = isHover ? colors.hover : '';
        } catch (error) {
            console.error('Error setting button background:', error);
        }
    }

    handleTouchStart() {
        if (!this.toggleButton) return;

        try {
            this.toggleButton.style.transform = 'scale(0.95)';
            this.setButtonBackground(true);
        } catch (error) {
            console.error('Error handling touch start:', error);
        }
    }

    handleTouchEnd() {
        if (!this.toggleButton) return;

        try {
            this.toggleButton.style.transform = 'scale(1)';
            setTimeout(() => this.setButtonBackground(false), 150);
        } catch (error) {
            console.error('Error handling touch end:', error);
        }
    }

    handleClick(e) {
        try {
            e.preventDefault();
            this.addRippleEffect();
            this.toggleTheme();
        } catch (error) {
            console.error('Error handling click:', error);
        }
    }

    handleKeydown(e) {
        try {
            if (['Enter', ' '].includes(e.key)) {
                e.preventDefault();
                this.toggleTheme();
            }
        } catch (error) {
            console.error('Error handling keydown:', error);
        }
    }

    // ==========================================
    // RIPPLE EFFECT (DRY)
    // ==========================================

    addRippleEffect() {
        if (!this.toggleButton) return;

        try {
            const ripple = this.createElement('div', {
                styles: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0',
                    background: this.config.rippleColor,
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    animation: 'apple-ripple 0.6s ease-out'
                }
            });

            this.ensureRippleKeyframes();
            this.toggleButton.appendChild(ripple);

            setTimeout(() => {
                try {
                    ripple.remove();
                } catch (error) {
                    // Element might already be removed
                }
            }, 600);
        } catch (error) {
            console.error('Error adding ripple effect:', error);
        }
    }

    ensureRippleKeyframes() {
        if (document.querySelector('#apple-ripple-keyframes')) return;

        try {
            const style = this.createElement('style', {
                attributes: { id: 'apple-ripple-keyframes' },
                innerHTML: `
                    @keyframes apple-ripple {
                        to {
                            width: 40px;
                            height: 40px;
                            opacity: 0;
                        }
                    }
                `
            });

            document.head.appendChild(style);
        } catch (error) {
            console.error('Error ensuring ripple keyframes:', error);
        }
    }

    // ==========================================
    // THEME MANAGEMENT (DRY)
    // ==========================================

    toggleTheme() {
        try {
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            this.trackThemeChange(newTheme);
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }

    setTheme(theme, withTransition = true) {
        try {
            if (!['light', 'dark'].includes(theme)) {
                console.warn(`Invalid theme: ${theme}. Using 'light' as fallback.`);
                theme = 'light';
            }

            this.currentTheme = theme;
            this.applyTheme(theme, withTransition);
            this.saveTheme(theme);
            this.updateToggleButton();
            this.dispatchThemeEvent(theme);
        } catch (error) {
            console.error('Error setting theme:', error);
        }
    }

    applyTheme(theme, withTransition = true) {
        try {
            const elements = [document.documentElement, document.body];

            elements.forEach(el => {
                if (el) {
                    el.classList.remove('light-theme', 'dark-theme');
                    el.classList.add(`${theme}-theme`);
                    el.setAttribute('data-theme', theme);
                }
            });

            this.updateMetaThemeColor(theme);

            if (withTransition) {
                this.addThemeTransition();
            }
        } catch (error) {
            console.error('Error applying theme:', error);
        }
    }

    updateMetaThemeColor(theme) {
        try {
            let meta = document.querySelector('meta[name="theme-color"]');

            if (!meta) {
                meta = this.createElement('meta', {
                    attributes: { name: 'theme-color' }
                });
                document.head.appendChild(meta);
            }

            meta.content = this.themeColors[theme].primary;
        } catch (error) {
            console.error('Error updating meta theme color:', error);
        }
    }

    addThemeTransition() {
        try {
            const transitionClass = 'apple-theme-transition';
            document.body.classList.add(transitionClass);

            this.ensureTransitionStyles();

            setTimeout(() => {
                try {
                    document.body.classList.remove(transitionClass);
                } catch (error) {
                    // Body might not exist anymore
                }
            }, this.config.transitionDuration);
        } catch (error) {
            console.error('Error adding theme transition:', error);
        }
    }

    ensureTransitionStyles() {
        if (document.querySelector('#apple-theme-transition-styles')) return;

        try {
            const style = this.createElement('style', {
                attributes: { id: 'apple-theme-transition-styles' },
                innerHTML: `
                    .apple-theme-transition,
                    .apple-theme-transition *,
                    .apple-theme-transition *:before,
                    .apple-theme-transition *:after {
                        transition: background-color ${this.config.transitionDuration}ms ${this.config.easing},
                                    color ${this.config.transitionDuration}ms ${this.config.easing},
                                    border-color ${this.config.transitionDuration}ms ${this.config.easing},
                                    box-shadow ${this.config.transitionDuration}ms ${this.config.easing} !important;
                    }
                `
            });

            document.head.appendChild(style);
        } catch (error) {
            console.error('Error ensuring transition styles:', error);
        }
    }

    updateToggleButton() {
        if (!this.toggleButton) return;

        try {
            this.toggleButton.innerHTML = this.getToggleIcon();
            this.toggleButton.setAttribute('aria-label', this.getAriaLabel());
        } catch (error) {
            console.error('Error updating toggle button:', error);
        }
    }

    // ==========================================
    // EVENT MANAGEMENT (DRY)
    // ==========================================

    setupEventListeners() {
        // Event listeners are set up in setupButtonEffects
    }

    setupSystemThemeListener() {
        try {
            if (this.prefersDark && this.prefersDark.addEventListener) {
                this.prefersDark.addEventListener('change', (e) => {
                    try {
                        if (!localStorage.getItem(this.config.storageKey)) {
                            const newTheme = e.matches ? 'dark' : 'light';
                            this.applyTheme(newTheme);
                            this.currentTheme = newTheme;
                            this.updateToggleButton();
                        }
                    } catch (error) {
                        console.error('Error handling system theme change:', error);
                    }
                });
            }
        } catch (error) {
            console.error('Error setting up system theme listener:', error);
        }
    }

    dispatchThemeEvent(theme) {
        try {
            document.dispatchEvent(new CustomEvent('appleThemeChanged', {
                detail: { theme, timestamp: Date.now() }
            }));
        } catch (error) {
            console.error('Error dispatching theme event:', error);
        }
    }

    // ==========================================
    // PERSISTENCE & ANALYTICS (DRY)
    // ==========================================

    saveTheme(theme) {
        try {
            localStorage.setItem(this.config.storageKey, theme);
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    trackThemeChange(theme) {
        console.log(`🍎 Theme changed to: ${theme}`);

        try {
            this.sendAnalytics('theme_change', { theme });
        } catch (error) {
            console.error('Error tracking theme change:', error);
        }
    }

    sendAnalytics(event, data) {
        try {
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', event, {
                    event_category: 'user_preference',
                    event_label: data.theme,
                    value: data.theme === 'dark' ? 1 : 0
                });
            }

            // Custom analytics
            if (window.analytics && typeof window.analytics.track === 'function') {
                window.analytics.track('Theme Changed', {
                    ...data,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error sending analytics:', error);
        }
    }

    // ==========================================
    // UTILITY METHODS (DRY)
    // ==========================================

    isTouchDevice() {
        try {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        } catch (error) {
            return false; // Fallback for environments without touch detection
        }
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    getCurrentTheme() {
        return this.currentTheme;
    }

    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    forceTheme(theme) {
        try {
            this.applyTheme(theme, false);
            this.currentTheme = theme;
            this.updateToggleButton();
        } catch (error) {
            console.error('Error forcing theme:', error);
        }
    }

    destroy() {
        try {
            if (this.toggleButton && this.toggleButton.parentNode) {
                this.toggleButton.remove();
            }

            // Remove injected styles
            ['#apple-ripple-keyframes', '#apple-theme-transition-styles']
                .forEach(selector => {
                    const el = document.querySelector(selector);
                    if (el) el.remove();
                });
        } catch (error) {
            console.error('Error destroying theme controller:', error);
        }
    }

    // ==========================================
    // CSS INJECTION (DRY) - Not needed if using external CSS
    // ==========================================

    injectStyles() {
        // Skip injection if external theme.css is being used
        if (document.querySelector('link[href*="theme.css"]')) {
            console.log('External theme.css detected, skipping style injection');
            return;
        }

        console.log('No external theme.css found, you should include theme.css file');
    }
}

// ==========================================
// EARLY THEME DETECTION (DRY)
// ==========================================

class AppleThemeDetector {
    static detect(storageKey = 'techfix-pro-theme') {
        try {
            const stored = localStorage.getItem(storageKey);
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = stored || (prefersDark ? 'dark' : 'light');

            // Apply immediately to prevent FOUC
            [document.documentElement, document.body].forEach(el => {
                if (el) {
                    el.setAttribute('data-theme', theme);
                    el.classList.add(`${theme}-theme`);
                }
            });

            // Update meta theme-color
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) {
                meta.content = theme === 'dark' ? '#000000' : '#f5f5f7';
            }

            return theme;
        } catch (error) {
            console.warn('Theme detection failed:', error);
            return 'light';
        }
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

// Auto-initialize function with error handling
function initializeAppleTheme(options = {}) {
    try {
        // Early detection if not already done
        if (!document.body.hasAttribute('data-theme')) {
            AppleThemeDetector.detect(options.storageKey);
        }

        // Initialize controller
        window.AppleTheme = new AppleThemeController(options);

        console.log('🍎 Apple Theme System initialized (DRY)');

        return window.AppleTheme;
    } catch (error) {
        console.error('Failed to initialize Apple Theme System:', error);
        return null;
    }
}

// Export for different usage patterns
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppleThemeController, AppleThemeDetector, initializeAppleTheme };
} else {
    window.AppleThemeController = AppleThemeController;
    window.AppleThemeDetector = AppleThemeDetector;
    window.initializeAppleTheme = initializeAppleTheme;
}

// Auto-initialize on DOM ready with enhanced error handling
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            initializeAppleTheme();
        } catch (error) {
            console.error('Error during DOMContentLoaded initialization:', error);
        }
    });
} else {
    // DOM already loaded
    try {
        initializeAppleTheme();
    } catch (error) {
        console.error('Error during immediate initialization:', error);
    }
}