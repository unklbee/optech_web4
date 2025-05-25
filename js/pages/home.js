// home.js start

/**
 * Apple.com Style Home Page JavaScript for TechFix Pro
 * Optimized for Apple-like interactions and responsive behavior
 */

// ==================================================
// APPLE-STYLE HERO CONTROLLER
// ==================================================

class AppleHeroController {
    constructor() {
        this.heroSection = document.querySelector('.hero-section');
        this.heroTitle = document.querySelector('.hero-title');
        this.heroSubtitle = document.querySelector('.hero-subtitle');
        this.heroCta = document.querySelector('.hero-cta');
        this.heroBackground = document.querySelector('.hero-bg');
        this.scrollIndicator = document.querySelector('.hero-scroll-indicator');

        this.viewport = window.AppleGlobal?.getViewport() || { isMobile: window.innerWidth <= 734 };
        this.hasAnimated = false;

        this.init();
    }

    init() {
        if (!this.heroSection) return;

        this.setupInitialStates();
        this.setupEntranceAnimation();
        this.setupParallax();
        this.setupScrollIndicator();
        this.setupResponsiveHandling();
    }

    /**
     * Setup initial states for Apple-style animation
     */
    setupInitialStates() {
        // Set initial states for staggered animation
        const elements = [
            { el: this.heroTitle, delay: 0, y: 60 },
            { el: this.heroSubtitle, delay: 200, y: 40 },
            { el: this.heroCta, delay: 400, y: 30 }
        ];

        elements.forEach(({ el, y }) => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = `translateY(${y}px)`;
                el.style.willChange = 'transform, opacity';
            }
        });
    }

    /**
     * Apple-style staggered entrance animation
     */
    setupEntranceAnimation() {
        // Use Intersection Observer for better performance
        if (window.AppleGlobal?.observeElement) {
            window.AppleGlobal.observeElement(this.heroSection, (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.triggerEntranceAnimation();
                        this.hasAnimated = true;
                    }
                });
            }, { threshold: 0.1 });
        } else {
            // Fallback
            setTimeout(() => this.triggerEntranceAnimation(), 300);
        }
    }

    /**
     * Trigger the entrance animation with Apple timing
     */
    triggerEntranceAnimation() {
        const elements = [
            { el: this.heroTitle, delay: 0 },
            { el: this.heroSubtitle, delay: 200 },
            { el: this.heroCta, delay: 400 }
        ];

        elements.forEach(({ el, delay }) => {
            if (el) {
                setTimeout(() => {
                    el.style.transition = `all 0.8s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay);
            }
        });

        // Animate scroll indicator last
        if (this.scrollIndicator) {
            setTimeout(() => {
                this.scrollIndicator.style.opacity = '0.6';
                this.scrollIndicator.style.animation = 'fadeInBounce 1s ease-out forwards';
            }, 1000);
        }
    }

    /**
     * Setup Apple-style parallax (disabled on mobile for performance)
     */
    setupParallax() {
        if (!this.heroBackground) return;

        const handleParallax = window.AppleGlobal?.debounce(() => {
            const viewport = window.AppleGlobal?.getViewport() || this.viewport;

            // Only enable parallax on desktop
            if (viewport.isDesktop) {
                const scrolled = window.pageYOffset;
                const heroHeight = this.heroSection.offsetHeight;
                const scrollPercent = scrolled / heroHeight;

                if (scrollPercent <= 1) {
                    const yPos = scrolled * 0.5;
                    this.heroBackground.style.transform = `translate3d(0, ${yPos}px, 0)`;
                }
            } else {
                // Reset on mobile/tablet
                this.heroBackground.style.transform = 'translate3d(0, 0, 0)';
            }
        }, 8);

        // Use intersection observer to optimize performance
        if (window.AppleGlobal?.observeElement) {
            window.AppleGlobal.observeElement(this.heroSection, (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        window.addEventListener('scroll', handleParallax);
                    } else {
                        window.removeEventListener('scroll', handleParallax);
                    }
                });
            }, { threshold: 0 });
        }
    }

    /**
     * Setup Apple-style scroll indicator
     */
    setupScrollIndicator() {
        if (!this.scrollIndicator) return;

        // Handle click with smooth scroll
        this.scrollIndicator.addEventListener('click', (e) => {
            e.preventDefault();
            const servicesSection = document.querySelector('#services');
            if (servicesSection) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 44;
                const targetPosition = servicesSection.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });

        // Apple-style hide/show on scroll
        const handleScroll = window.AppleGlobal?.debounce(() => {
            const scrolled = window.pageYOffset;

            if (scrolled > 200) {
                this.scrollIndicator.style.opacity = '0';
                this.scrollIndicator.style.transform = 'translateX(-50%) translateY(20px)';
            } else {
                this.scrollIndicator.style.opacity = '0.6';
                this.scrollIndicator.style.transform = 'translateX(-50%) translateY(0)';
            }
        }, 16);

        window.addEventListener('scroll', handleScroll);
    }

    /**
     * Handle responsive behavior changes
     */
    setupResponsiveHandling() {
        const handleResize = window.AppleGlobal?.debounce(() => {
            this.viewport = window.AppleGlobal?.getViewport() || {
                isMobile: window.innerWidth <= 734,
                isTablet: window.innerWidth > 734 && window.innerWidth <= 1067,
                isDesktop: window.innerWidth > 1067
            };

            // Adjust animations based on viewport
            if (this.viewport.isMobile) {
                this.optimizeForMobile();
            } else {
                this.optimizeForDesktop();
            }
        }, 100);

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 200);
        });
    }

    /**
     * Optimize animations for mobile
     */
    optimizeForMobile() {
        // Disable parallax on mobile
        if (this.heroBackground) {
            this.heroBackground.style.transform = 'none';
            this.heroBackground.style.backgroundAttachment = 'scroll';
        }

        // Adjust animation timing for mobile
        const elements = [this.heroTitle, this.heroSubtitle, this.heroCta];
        elements.forEach(el => {
            if (el) {
                el.style.transition = `all 0.6s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
            }
        });
    }

    /**
     * Optimize animations for desktop
     */
    optimizeForDesktop() {
        // Re-enable parallax on desktop
        if (this.heroBackground) {
            this.heroBackground.style.backgroundAttachment = 'fixed';
        }

        // Full animation timing for desktop
        const elements = [this.heroTitle, this.heroSubtitle, this.heroCta];
        elements.forEach(el => {
            if (el) {
                el.style.transition = `all 0.8s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
            }
        });
    }
}

// ==================================================
// APPLE-STYLE SERVICES CONTROLLER
// ==================================================

class AppleServicesController {
    constructor() {
        this.servicesSection = document.querySelector('.services-preview');
        this.serviceCards = document.querySelectorAll('.service-card');
        this.hasAnimated = false;

        this.init();
    }

    init() {
        if (!this.servicesSection || this.serviceCards.length === 0) return;

        this.setupCardAnimations();
        this.setupCardInteractions();
        this.setupResponsiveBehavior();
    }

    /**
     * Setup Apple-style card entrance animations
     */
    setupCardAnimations() {
        // Set initial states
        this.serviceCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(60px)';
            card.style.willChange = 'transform, opacity';
        });

        // Use Intersection Observer for scroll-triggered animation
        if (window.AppleGlobal?.observeElement) {
            window.AppleGlobal.observeElement(this.servicesSection, (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateCards();
                        this.hasAnimated = true;
                    }
                });
            }, { threshold: 0.2 });
        } else {
            // Fallback for older browsers
            setTimeout(() => this.animateCards(), 500);
        }
    }

    /**
     * Animate service cards with Apple-style staggering
     */
    animateCards() {
        this.serviceCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = `all 0.6s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';

                // Add completed class for further styling
                card.classList.add('animate-complete');
            }, index * 150);
        });
    }

    /**
     * Setup Apple-style card interactions
     */
    setupCardInteractions() {
        this.serviceCards.forEach(card => {
            const icon = card.querySelector('.service-icon');
            const button = card.querySelector('.btn');

            // Apple-style hover effects (desktop only)
            if (!window.AppleGlobal?.isTouchDevice()) {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-8px)';
                    card.style.transition = `all 0.3s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;

                    if (icon) {
                        icon.style.transform = 'scale(1.05)';
                        icon.style.transition = `transform 0.3s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
                    }
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';

                    if (icon) {
                        icon.style.transform = 'scale(1)';
                    }
                });
            }

            // Touch interactions for mobile
            if (window.AppleGlobal?.isTouchDevice()) {
                card.addEventListener('touchstart', () => {
                    card.style.transform = 'scale(0.98)';
                    card.style.transition = `transform 0.1s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
                }, { passive: true });

                card.addEventListener('touchend', () => {
                    card.style.transform = 'scale(1)';
                    setTimeout(() => {
                        card.style.transform = 'translateY(-4px)';
                        card.style.transition = `transform 0.3s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;

                        setTimeout(() => {
                            card.style.transform = 'translateY(0)';
                        }, 200);
                    }, 100);
                }, { passive: true });
            }

            // Make entire card clickable (Apple pattern)
            card.addEventListener('click', (e) => {
                const link = card.querySelector('a[href]');
                if (link && e.target !== link) {
                    e.preventDefault();

                    // Apple-style click feedback
                    card.style.transform = 'scale(0.96)';
                    setTimeout(() => {
                        card.style.transform = 'scale(1)';
                        window.location.href = link.href;
                    }, 150);
                }
            });

            // Keyboard accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    /**
     * Setup responsive behavior for service cards
     */
    setupResponsiveBehavior() {
        const handleResize = window.AppleGlobal?.debounce(() => {
            const viewport = window.AppleGlobal?.getViewport() || { isMobile: window.innerWidth <= 734 };

            if (viewport.isMobile) {
                this.optimizeForMobile();
            } else {
                this.optimizeForDesktop();
            }
        }, 100);

        window.addEventListener('resize', handleResize);

        // Initial optimization
        handleResize();
    }

    /**
     * Optimize cards for mobile
     */
    optimizeForMobile() {
        this.serviceCards.forEach(card => {
            // Adjust spacing and sizing for mobile
            const cardBody = card.querySelector('.card-body');
            if (cardBody) {
                cardBody.style.padding = '32px 24px';
            }

            // Simplify animations on mobile
            card.style.transition = `all 0.3s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
        });
    }

    /**
     * Optimize cards for desktop
     */
    optimizeForDesktop() {
        this.serviceCards.forEach(card => {
            // Reset desktop styling
            const cardBody = card.querySelector('.card-body');
            if (cardBody) {
                cardBody.style.padding = '40px 32px';
            }

            // Full animations on desktop
            card.style.transition = `all 0.4s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
        });
    }
}

// ==================================================
// APPLE-STYLE ABOUT CONTROLLER
// ==================================================

class AppleAboutController {
    constructor() {
        this.aboutSection = document.querySelector('.about-snippet');
        this.aboutContent = document.querySelector('.about-content');
        this.aboutImage = document.querySelector('.about-snippet img');
        this.featureItems = document.querySelectorAll('.feature-list li');
        this.hasAnimated = false;

        this.init();
    }

    init() {
        if (!this.aboutSection) return;

        this.setupScrollAnimation();
        this.setupImageInteraction();
        this.setupResponsiveBehavior();
    }

    /**
     * Setup Apple-style scroll-triggered animations
     */
    setupScrollAnimation() {
        // Set initial states
        if (this.aboutContent) {
            this.aboutContent.style.opacity = '0';
            this.aboutContent.style.transform = 'translateX(-60px)';
        }

        if (this.aboutImage) {
            this.aboutImage.style.opacity = '0';
            this.aboutImage.style.transform = 'translateX(60px)';
        }

        this.featureItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
        });

        // Intersection Observer for animation trigger
        if (window.AppleGlobal?.observeElement) {
            window.AppleGlobal.observeElement(this.aboutSection, (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateSection();
                        this.hasAnimated = true;
                    }
                });
            }, { threshold: 0.3 });
        }
    }

    /**
     * Animate about section with Apple timing
     */
    animateSection() {
        // Animate content
        if (this.aboutContent) {
            setTimeout(() => {
                this.aboutContent.style.transition = `all 0.8s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
                this.aboutContent.style.opacity = '1';
                this.aboutContent.style.transform = 'translateX(0)';
            }, 200);
        }

        // Animate image
        if (this.aboutImage) {
            setTimeout(() => {
                this.aboutImage.style.transition = `all 0.8s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
                this.aboutImage.style.opacity = '1';
                this.aboutImage.style.transform = 'translateX(0)';
            }, 400);
        }

        // Animate feature items
        this.featureItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = `all 0.5s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 600 + (index * 100));
        });
    }

    /**
     * Setup Apple-style image interactions
     */
    setupImageInteraction() {
        if (!this.aboutImage) return;

        // Desktop hover effects
        if (!window.AppleGlobal?.isTouchDevice()) {
            this.aboutImage.addEventListener('mouseenter', () => {
                this.aboutImage.style.transform = 'scale(1.02) rotate(1deg)';
                this.aboutImage.style.transition = `transform 0.4s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
            });

            this.aboutImage.addEventListener('mouseleave', () => {
                this.aboutImage.style.transform = 'scale(1) rotate(0deg)';
            });
        }

        // Touch interactions for mobile
        if (window.AppleGlobal?.isTouchDevice()) {
            this.aboutImage.addEventListener('touchstart', () => {
                this.aboutImage.style.transform = 'scale(0.98)';
                this.aboutImage.style.transition = `transform 0.2s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
            }, { passive: true });

            this.aboutImage.addEventListener('touchend', () => {
                this.aboutImage.style.transform = 'scale(1)';
            }, { passive: true });
        }
    }

    /**
     * Setup responsive behavior
     */
    setupResponsiveBehavior() {
        const handleResize = window.AppleGlobal?.debounce(() => {
            const viewport = window.AppleGlobal?.getViewport() || { isMobile: window.innerWidth <= 734 };

            if (viewport.isMobile) {
                this.optimizeForMobile();
            } else {
                this.optimizeForDesktop();
            }
        }, 100);

        window.addEventListener('resize', handleResize);
        handleResize();
    }

    /**
     * Optimize for mobile viewing
     */
    optimizeForMobile() {
        // Adjust animation timings for mobile
        if (this.aboutContent) {
            this.aboutContent.style.transition = `all 0.6s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
        }

        if (this.aboutImage) {
            this.aboutImage.style.transition = `all 0.6s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
        }
    }

    /**
     * Optimize for desktop viewing
     */
    optimizeForDesktop() {
        // Full animation timing for desktop
        if (this.aboutContent) {
            this.aboutContent.style.transition = `all 0.8s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
        }

        if (this.aboutImage) {
            this.aboutImage.style.transition = `all 0.8s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
        }
    }
}

// ==================================================
// APPLE-STYLE CTA CONTROLLER
// ==================================================

class AppleCTAController {
    constructor() {
        this.ctaSection = document.querySelector('.contact-cta');
        this.ctaButtons = document.querySelectorAll('.contact-cta .btn');
        this.hasAnimated = false;

        this.init();
    }

    init() {
        if (!this.ctaSection) return;

        this.setupScrollAnimation();
        this.setupButtonInteractions();
    }

    /**
     * Setup Apple-style CTA animations
     */
    setupScrollAnimation() {
        const title = this.ctaSection.querySelector('h2');
        const subtitle = this.ctaSection.querySelector('.lead');

        // Set initial states
        [title, subtitle, ...this.ctaButtons].forEach(el => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(40px)';
            }
        });

        // Intersection Observer
        if (window.AppleGlobal?.observeElement) {
            window.AppleGlobal.observeElement(this.ctaSection, (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateCTA();
                        this.hasAnimated = true;
                    }
                });
            }, { threshold: 0.4 });
        }
    }

    /**
     * Animate CTA section
     */
    animateCTA() {
        const title = this.ctaSection.querySelector('h2');
        const subtitle = this.ctaSection.querySelector('.lead');

        const elements = [
            { el: title, delay: 0 },
            { el: subtitle, delay: 200 },
            ...Array.from(this.ctaButtons).map((btn, index) => ({ el: btn, delay: 400 + (index * 150) }))
        ];

        elements.forEach(({ el, delay }) => {
            if (el) {
                setTimeout(() => {
                    el.style.transition = `all 0.6s ${window.AppleGlobal?.APPLE_EASING || 'cubic-bezier(0.4, 0, 0.6, 1)'}`;
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, delay);
            }
        });
    }

    /**
     * Setup Apple-style button interactions
     */
    setupButtonInteractions() {
        this.ctaButtons.forEach(button => {
            // Desktop hover effects
            if (!window.AppleGlobal?.isTouchDevice()) {
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-3px) scale(1.02)';
                    button.style.transition = `transform 0.2s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
                });

                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateY(0) scale(1)';
                });
            }

            // Touch interactions
            if (window.AppleGlobal?.isTouchDevice()) {
                button.addEventListener('touchstart', () => {
                    button.style.transform = 'scale(0.96)';
                    button.style.transition = `transform 0.1s ${window.AppleGlobal?.APPLE_EASING || 'ease-out'}`;
                }, { passive: true });

                button.addEventListener('touchend', () => {
                    button.style.transform = 'scale(1)';
                }, { passive: true });
            }

            // Click tracking
            button.addEventListener('click', () => {
                this.trackCTAClick(button);
            });
        });
    }

    /**
     * Track CTA interactions
     */
    trackCTAClick(button) {
        const buttonText = button.textContent.trim();
        console.log(`🍎 CTA clicked: ${buttonText}`);

        // Analytics integration point
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cta_click', {
                'event_category': 'engagement',
                'event_label': buttonText
            });
        }
    }
}

// ==================================================
// APPLE-STYLE PERFORMANCE MONITOR
// ==================================================

class ApplePerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeAnimations();
        this.setupVisibilityHandling();
        this.monitorPerformance();
    }

    /**
     * Optimize animations for performance
     */
    optimizeAnimations() {
        // Add will-change property for animated elements
        const animatedElements = document.querySelectorAll([
            '.hero-title',
            '.hero-subtitle',
            '.service-card',
            '.about-content',
            '.about-snippet img'
        ].join(','));

        animatedElements.forEach(el => {
            el.style.willChange = 'transform, opacity';
        });

        // Remove will-change after animations complete
        setTimeout(() => {
            animatedElements.forEach(el => {
                el.style.willChange = 'auto';
            });
        }, 3000);
    }

    /**
     * Handle page visibility changes (Apple optimization)
     */
    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause animations when page is hidden
                document.body.classList.add('page-hidden');
            } else {
                // Resume animations when page becomes visible
                document.body.classList.remove('page-hidden');
            }
        });
    }

    /**
     * Monitor performance metrics
     */
    monitorPerformance() {
        // Monitor frame rate
        let lastFrameTime = performance.now();
        let frameCount = 0;

        function checkFrameRate(currentTime) {
            frameCount++;

            if (currentTime - lastFrameTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastFrameTime = currentTime;

                // Optimize if low FPS detected
                if (fps < 30) {
                    document.body.classList.add('low-performance');
                } else {
                    document.body.classList.remove('low-performance');
                }
            }

            requestAnimationFrame(checkFrameRate);
        }

        requestAnimationFrame(checkFrameRate);
    }
}

// ==================================================
// INITIALIZATION WITH APPLE TIMING
// ==================================================

/**
 * Initialize all Apple-style home page controllers
 */
function initializeAppleHome() {
    // Wait for global scripts
    if (document.body.classList.contains('apple-global-loaded')) {
        startAppleHomeControllers();
    } else {
        document.addEventListener('appleGlobalLoaded', startAppleHomeControllers);
        // Fallback timeout
        setTimeout(startAppleHomeControllers, 1000);
    }
}

/**
 * Start all home page controllers with Apple timing
 */
function startAppleHomeControllers() {
    try {
        // Initialize with staggered timing (Apple pattern)
        const controllers = [
            () => new ApplePerformanceMonitor(),
            () => new AppleHeroController(),
            () => new AppleServicesController(),
            () => new AppleAboutController(),
            () => new AppleCTAController()
        ];

        controllers.forEach((initController, index) => {
            setTimeout(initController, index * 100);
        });

        // Mark as fully loaded
        setTimeout(() => {
            document.body.classList.add('apple-home-loaded');
            document.dispatchEvent(new CustomEvent('appleHomeLoaded'));
            console.log('🍎 Apple-style home page initialized');
        }, 500);

    } catch (error) {
        console.error('Error initializing Apple home page:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppleHome);
} else {
    initializeAppleHome();
}

// Export for module usage
window.AppleHome = {
    AppleHeroController,
    AppleServicesController,
    AppleAboutController,
    AppleCTAController,
    ApplePerformanceMonitor
};

// home.js end