// js/pages/home.js - Fixed version with no duplicate variable declarations

/**
 * Apple.com Style Home Page JavaScript - Modular Version
 * Uses the new modular system for better maintainability
 */

// Wait for Apple Global to be loaded
function waitForAppleGlobal() {
    return new Promise((resolve) => {
        if (window.AppleGlobal?.initialized) {
            resolve();
        } else {
            document.addEventListener('appleGlobalLoaded', resolve, { once: true });
        }
    });
}

/**
 * Apple-style Hero Controller - Modular Version
 */
class AppleHeroController {
    constructor() {
        this.elements = this.cacheElements();
        this.state = {
            hasAnimated: false,
            viewport: window.AppleGlobal.getViewport()
        };
        this.cleanupFunctions = [];

        if (this.elements.section) {
            this.init();
        }
    }

    cacheElements() {
        return {
            section: window.AppleGlobal.select('.hero-section'),
            title: window.AppleGlobal.select('.hero-title'),
            subtitle: window.AppleGlobal.select('.hero-subtitle'),
            cta: window.AppleGlobal.select('.hero-cta'),
            background: window.AppleGlobal.select('.hero-bg'),
            scrollIndicator: window.AppleGlobal.select('.hero-scroll-indicator')
        };
    }

    init() {
        this.setupInitialStates();
        this.setupEntranceAnimation();
        this.setupParallax();
        this.setupScrollIndicator();
        this.setupResponsiveHandling();
    }

    setupInitialStates() {
        const elements = [
            { el: this.elements.title, y: 60 },
            { el: this.elements.subtitle, y: 40 },
            { el: this.elements.cta, y: 30 }
        ];

        elements.forEach(({ el, y }) => {
            if (el) {
                window.AppleGlobal.setStyles(el, {
                    opacity: '0',
                    transform: `translateY(${y}px)`,
                    willChange: 'transform, opacity'
                });
            }
        });
    }

    setupEntranceAnimation() {
        const { observeIntersection } = window.AppleGlobal;

        observeIntersection(this.elements.section, (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.state.hasAnimated) {
                    this.triggerEntranceAnimation();
                    this.state.hasAnimated = true;
                }
            });
        }, { threshold: 0.1 });
    }

    triggerEntranceAnimation() {
        const { entranceAnimation } = window.AppleGlobal;
        const elements = [this.elements.title, this.elements.subtitle, this.elements.cta];

        entranceAnimation(elements.filter(el => el), {
            duration: 800,
            stagger: 200
        }).then(() => {
            // Animate scroll indicator
            if (this.elements.scrollIndicator) {
                window.AppleGlobal.fadeIn(this.elements.scrollIndicator, { duration: 500 });
            }
        });
    }

    setupParallax() {
        if (!this.elements.background) return;

        const { createParallax, prefersReducedMotion } = window.AppleGlobal;

        // Only enable parallax on desktop and if motion is not reduced
        if (!prefersReducedMotion() && this.state.viewport.isDesktop) {
            const cleanup = createParallax(this.elements.background, {
                speed: 0.5,
                direction: 'vertical'
            });

            this.cleanupFunctions.push(cleanup);
        }
    }

    setupScrollIndicator() {
        if (!this.elements.scrollIndicator) return;

        const { addEvent, scrollToElement } = window.AppleGlobal;

        // Click handler
        this.cleanupFunctions.push(
            addEvent(this.elements.scrollIndicator, 'click', (e) => {
                e.preventDefault();
                const servicesSection = document.getElementById('services');
                if (servicesSection) {
                    scrollToElement(servicesSection);
                }
            })
        );

        // Hide on scroll
        const { observeScrollProgress } = window.AppleGlobal;
        const cleanup = observeScrollProgress(this.elements.section, (progress) => {
            const opacity = Math.max(0, 1 - (progress * 2));
            window.AppleGlobal.setStyles(this.elements.scrollIndicator, {
                opacity: opacity.toString(),
                transform: `translateX(-50%) translateY(${progress * 20}px)`
            });
        });

        this.cleanupFunctions.push(cleanup);
    }

    setupResponsiveHandling() {
        const { observeViewport } = window.AppleGlobal;

        const cleanup = observeViewport((viewport) => {
            this.state.viewport = viewport;

            if (viewport.isMobile) {
                this.optimizeForMobile();
            } else {
                this.optimizeForDesktop();
            }
        });

        this.cleanupFunctions.push(cleanup);
    }

    optimizeForMobile() {
        // Disable parallax and optimize animations for mobile
        if (this.elements.background) {
            window.AppleGlobal.setStyles(this.elements.background, {
                transform: 'none',
                backgroundAttachment: 'scroll'
            });
        }
    }

    optimizeForDesktop() {
        // Re-enable full animations for desktop
        if (this.elements.background) {
            window.AppleGlobal.setStyles(this.elements.background, {
                backgroundAttachment: 'fixed'
            });
        }
    }

    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
    }
}

/**
 * Apple-style Services Controller - Modular Version
 */
class AppleServicesController {
    constructor() {
        this.elements = this.cacheElements();
        this.state = {
            hasAnimated: false
        };
        this.cleanupFunctions = [];

        if (this.elements.section && this.elements.cards.length > 0) {
            this.init();
        }
    }

    cacheElements() {
        return {
            section: window.AppleGlobal.select('.services-preview'),
            cards: Array.from(window.AppleGlobal.selectAll('.service-card') || [])
        };
    }

    init() {
        try {
            this.setupCardAnimations();
            this.setupCardInteractions();
        } catch (error) {
            console.error('🍎 Error initializing services controller:', error);
        }
    }

    setupCardAnimations() {
        const { observeIntersection, entranceAnimation } = window.AppleGlobal;

        observeIntersection(this.elements.section, (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.state.hasAnimated) {
                    entranceAnimation(this.elements.cards, {
                        duration: 600,
                        stagger: 150
                    });
                    this.state.hasAnimated = true;
                }
            });
        }, { threshold: 0.2 });
    }

    setupCardInteractions() {
        const { addEvent, isTouchDevice, APPLE_EASING } = window.AppleGlobal;

        if (!this.elements.cards || this.elements.cards.length === 0) {
            console.warn('🍎 No service cards found for interaction setup');
            return;
        }

        this.elements.cards.forEach(card => {
            const icon = card.querySelector('.service-icon');

            // Desktop hover effects
            if (!isTouchDevice()) {
                this.cleanupFunctions.push(
                    addEvent(card, 'mouseenter', () => {
                        window.AppleGlobal.setStyles(card, {
                            transform: 'translateY(-8px)',
                            transition: `all 0.3s ${APPLE_EASING}`
                        });

                        if (icon) {
                            window.AppleGlobal.setStyles(icon, {
                                transform: 'scale(1.05)',
                                transition: `transform 0.3s ${APPLE_EASING}`
                            });
                        }
                    })
                );

                this.cleanupFunctions.push(
                    addEvent(card, 'mouseleave', () => {
                        window.AppleGlobal.setStyles(card, {
                            transform: 'translateY(0)'
                        });

                        if (icon) {
                            window.AppleGlobal.setStyles(icon, {
                                transform: 'scale(1)'
                            });
                        }
                    })
                );
            }

            // Touch interactions
            if (isTouchDevice()) {
                this.cleanupFunctions.push(
                    addEvent(card, 'touchstart', () => {
                        window.AppleGlobal.scaleElement(card, 0.98, { duration: 100 });
                    }, { passive: true })
                );

                this.cleanupFunctions.push(
                    addEvent(card, 'touchend', () => {
                        window.AppleGlobal.scaleElement(card, 1, { duration: 200 });
                    }, { passive: true })
                );
            }

            // Make card clickable
            this.cleanupFunctions.push(
                addEvent(card, 'click', (e) => {
                    const link = card.querySelector('a[href]');
                    if (link && e.target !== link) {
                        e.preventDefault();

                        window.AppleGlobal.scaleElement(card, 0.96, { duration: 150 })
                            .then(() => window.AppleGlobal.scaleElement(card, 1, { duration: 150 }))
                            .then(() => {
                                window.location.href = link.href;
                            });
                    }
                })
            );

            // Keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');

            this.cleanupFunctions.push(
                addEvent(card, 'keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        card.click();
                    }
                })
            );
        });
    }

    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
    }
}

/**
 * Apple-style About Controller - Modular Version
 */
class AppleAboutController {
    constructor() {
        this.elements = this.cacheElements();
        this.state = {
            hasAnimated: false
        };
        this.cleanupFunctions = [];

        if (this.elements.section) {
            this.init();
        }
    }

    cacheElements() {
        return {
            section: window.AppleGlobal.select('.about-snippet'),
            content: window.AppleGlobal.select('.about-content'),
            image: window.AppleGlobal.select('.about-snippet img'),
            featureItems: Array.from(window.AppleGlobal.selectAll('.feature-list li') || [])
        };
    }

    init() {
        try {
            this.setupScrollAnimation();
            this.setupImageInteraction();
        } catch (error) {
            console.error('🍎 Error initializing about controller:', error);
        }
    }

    setupScrollAnimation() {
        const { observeIntersection, animateElement } = window.AppleGlobal;

        observeIntersection(this.elements.section, (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.state.hasAnimated) {
                    this.animateSection();
                    this.state.hasAnimated = true;
                }
            });
        }, { threshold: 0.3 });
    }

    animateSection() {
        const { animateElement, staggerAnimation } = window.AppleGlobal;

        // Animate content
        if (this.elements.content) {
            animateElement(this.elements.content, [
                { opacity: 0, transform: 'translateX(-60px)' },
                { opacity: 1, transform: 'translateX(0)' }
            ], { duration: 800, delay: 200 });
        }

        // Animate image
        if (this.elements.image) {
            animateElement(this.elements.image, [
                { opacity: 0, transform: 'translateX(60px)' },
                { opacity: 1, transform: 'translateX(0)' }
            ], { duration: 800, delay: 400 });
        }

        // Animate feature items
        if (this.elements.featureItems.length > 0) {
            staggerAnimation(this.elements.featureItems, [
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 500,
                stagger: 100,
                delay: 600
            });
        }
    }

    setupImageInteraction() {
        if (!this.elements.image) return;

        const { addEvent, isTouchDevice, APPLE_EASING } = window.AppleGlobal;

        // Desktop hover effects
        if (!isTouchDevice()) {
            this.cleanupFunctions.push(
                addEvent(this.elements.image, 'mouseenter', () => {
                    window.AppleGlobal.setStyles(this.elements.image, {
                        transform: 'scale(1.02) rotate(1deg)',
                        transition: `transform 0.4s ${APPLE_EASING}`
                    });
                })
            );

            this.cleanupFunctions.push(
                addEvent(this.elements.image, 'mouseleave', () => {
                    window.AppleGlobal.setStyles(this.elements.image, {
                        transform: 'scale(1) rotate(0deg)'
                    });
                })
            );
        }

        // Touch interactions
        if (isTouchDevice()) {
            this.cleanupFunctions.push(
                addEvent(this.elements.image, 'touchstart', () => {
                    window.AppleGlobal.scaleElement(this.elements.image, 0.98, { duration: 200 });
                }, { passive: true })
            );

            this.cleanupFunctions.push(
                addEvent(this.elements.image, 'touchend', () => {
                    window.AppleGlobal.scaleElement(this.elements.image, 1, { duration: 200 });
                }, { passive: true })
            );
        }
    }

    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
    }
}

/**
 * Apple-style CTA Controller - Modular Version
 */
class AppleCTAController {
    constructor() {
        this.elements = this.cacheElements();
        this.state = {
            hasAnimated: false
        };
        this.cleanupFunctions = [];

        if (this.elements.section) {
            this.init();
        }
    }

    cacheElements() {
        return {
            section: window.AppleGlobal.select('.contact-cta'),
            buttons: window.AppleGlobal.selectAll('.contact-cta .btn')
        };
    }

    init() {
        try {
            this.setupScrollAnimation();
            this.setupButtonInteractions();
        } catch (error) {
            console.error('🍎 Error initializing CTA controller:', error);
        }
    }

    setupScrollAnimation() {
        const { observeIntersection, entranceAnimation } = window.AppleGlobal;

        observeIntersection(this.elements.section, (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.state.hasAnimated) {
                    this.animateCTA();
                    this.state.hasAnimated = true;
                }
            });
        }, { threshold: 0.4 });
    }

    animateCTA() {
        const title = this.elements.section.querySelector('h2');
        const subtitle = this.elements.section.querySelector('.lead');
        const elements = [title, subtitle, ...this.elements.buttons].filter(el => el);

        window.AppleGlobal.entranceAnimation(elements, {
            duration: 600,
            stagger: 200
        });
    }

    setupButtonInteractions() {
        const { addEvent, isTouchDevice, APPLE_EASING } = window.AppleGlobal;

        if (!this.elements.buttons || this.elements.buttons.length === 0) {
            console.warn('🍎 No CTA buttons found for interaction setup');
            return;
        }

        this.elements.buttons.forEach(button => {
            // Desktop hover effects
            if (!isTouchDevice()) {
                this.cleanupFunctions.push(
                    addEvent(button, 'mouseenter', () => {
                        window.AppleGlobal.setStyles(button, {
                            transform: 'translateY(-3px) scale(1.02)',
                            transition: `transform 0.2s ${APPLE_EASING}`
                        });
                    })
                );

                this.cleanupFunctions.push(
                    addEvent(button, 'mouseleave', () => {
                        window.AppleGlobal.setStyles(button, {
                            transform: 'translateY(0) scale(1)'
                        });
                    })
                );
            }

            // Touch interactions
            if (isTouchDevice()) {
                this.cleanupFunctions.push(
                    addEvent(button, 'touchstart', () => {
                        window.AppleGlobal.scaleElement(button, 0.96, { duration: 100 });
                    }, { passive: true })
                );

                this.cleanupFunctions.push(
                    addEvent(button, 'touchend', () => {
                        window.AppleGlobal.scaleElement(button, 1, { duration: 100 });
                    }, { passive: true })
                );
            }

            // Click tracking
            this.cleanupFunctions.push(
                addEvent(button, 'click', () => {
                    this.trackCTAClick(button);
                })
            );
        });
    }

    trackCTAClick(button) {
        const buttonText = button.textContent.trim();
        console.log(`🍎 CTA clicked: ${buttonText}`);

        // Analytics integration
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cta_click', {
                'event_category': 'engagement',
                'event_label': buttonText
            });
        }
    }

    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
        this.cleanupFunctions = [];
    }
}

/**
 * Apple-style Performance Monitor - Modular Version
 */
class ApplePerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        try {
            this.optimizeAnimations();
            this.setupVisibilityHandling();
            this.monitorInteractions();
        } catch (error) {
            console.error('🍎 Error initializing performance monitor:', error);
        }
    }

    optimizeAnimations() {
        // Add will-change for animated elements
        const animatedElements = window.AppleGlobal.selectAll([
            '.hero-title',
            '.hero-subtitle',
            '.service-card',
            '.about-content',
            '.about-snippet img'
        ].join(','));

        animatedElements.forEach(el => {
            window.AppleGlobal.setStyles(el, { willChange: 'transform, opacity' });
        });

        // Clean up will-change after animations
        setTimeout(() => {
            animatedElements.forEach(el => {
                window.AppleGlobal.setStyles(el, { willChange: 'auto' });
            });
        }, 3000);
    }

    setupVisibilityHandling() {
        const { observeVisibility } = window.AppleGlobal;

        observeVisibility(({ isVisible }) => {
            if (isVisible) {
                document.body.classList.remove('page-hidden');
            } else {
                document.body.classList.add('page-hidden');
            }
        });
    }

    monitorInteractions() {
        // Monitor user interactions for performance insights
        const interactionStart = performance.now();

        ['click', 'touchstart', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                const interactionTime = performance.now() - interactionStart;
                window.AppleGlobal.lastInteraction = interactionTime;
            }, { once: true, passive: true });
        });
    }
}

/**
 * Home Page Controller - Orchestrates all components
 */
class AppleHomePageController {
    constructor() {
        this.controllers = new Map();
        this.initialized = false;

        this.init();
    }

    async init() {
        try {
            // Wait for Apple Global to be ready
            await waitForAppleGlobal();

            console.log('🍎 Initializing Apple Home Page...');

            // Initialize controllers with staggered timing
            const controllerClasses = [
                ['performance', ApplePerformanceMonitor],
                ['hero', AppleHeroController],
                ['services', AppleServicesController],
                ['about', AppleAboutController],
                ['cta', AppleCTAController]
            ];

            controllerClasses.forEach(([name, ControllerClass], index) => {
                setTimeout(() => {
                    try {
                        const controller = new ControllerClass();
                        this.controllers.set(name, controller);
                        console.log(`🍎 ${name} controller initialized`);
                    } catch (error) {
                        console.error(`🍎 Error initializing ${name} controller:`, error);
                    }
                }, index * 100);
            });

            // Mark as initialized
            setTimeout(() => {
                this.markInitialized();
            }, 500);

        } catch (error) {
            console.error('🍎 Home page initialization failed:', error);
        }
    }

    markInitialized() {
        this.initialized = true;
        document.body.classList.add('apple-home-loaded');

        // Register with global system
        if (window.AppleGlobal.registerComponent) {
            window.AppleGlobal.registerComponent('homePage', this);
        }

        // Dispatch event
        document.dispatchEvent(new CustomEvent('appleHomeLoaded', {
            detail: {
                controllers: Array.from(this.controllers.keys())
            }
        }));

        console.log('🍎 Apple Home Page fully initialized');
    }

    getController(name) {
        return this.controllers.get(name);
    }

    destroy() {
        console.log('🍎 Destroying Apple Home Page...');

        this.controllers.forEach((controller, name) => {
            if (controller && typeof controller.destroy === 'function') {
                controller.destroy();
            }
        });

        this.controllers.clear();
        document.body.classList.remove('apple-home-loaded');
    }

    getStatus() {
        return {
            initialized: this.initialized,
            controllers: Array.from(this.controllers.keys()),
            performance: window.AppleGlobal.getStatus?.()?.performance || {}
        };
    }
}

/**
 * Initialize home page when ready
 */
function initializeAppleHome() {
    // Check if already initialized
    if (window.AppleHomePage) {
        console.log('🍎 Apple Home Page already initialized');
        return window.AppleHomePage;
    }

    // Create home page controller
    window.AppleHomePage = new AppleHomePageController();
    return window.AppleHomePage;
}

/**
 * Auto-initialize based on document ready state
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppleHome);
} else {
    // DOM is already ready
    initializeAppleHome();
}

// Export for ES modules
export {
    AppleHeroController,
    AppleServicesController,
    AppleAboutController,
    AppleCTAController,
    ApplePerformanceMonitor,
    AppleHomePageController,
    initializeAppleHome
};

// Legacy support
window.initializeAppleHome = initializeAppleHome;