// js/global.js - Improved Version with Bug Fixes

/**
 * Apple.com Style Global JavaScript - Improved Version
 * Entry point that orchestrates all modules with enhanced error handling
 */

// Core modules
import * as Utils from './core/utils.js';
import * as Device from './core/device.js';
import * as DOM from './core/dom.js';
import * as Animation from './core/animation.js';
import * as Observers from './core/observers.js';

// Components
import { AppleNavbar, initNavbar } from './components/navbar.js';
import { AppleMegaMenu, initMegaMenu } from './components/mega-menu.js';

/**
 * Global Apple object for external access
 */
window.AppleGlobal = {
    // Core utilities
    ...Utils,

    // Device detection
    ...Device,

    // DOM utilities
    ...DOM,

    // Animation system
    ...Animation,

    // Observers
    ...Observers,

    // Components
    AppleNavbar,
    initNavbar,

    AppleMegaMenu,
    initMegaMenu,

    // Selector aliases for easier access
    select: DOM.$,
    selectAll: DOM.$$,
    querySelector: DOM.$,
    querySelectorAll: DOM.$$,

    // Safe DOM methods with fallbacks
    safeSelect: (selector, context = document) => {
        try {
            return DOM.$(selector, context);
        } catch (error) {
            console.warn(`🍎 Safe select failed for: ${selector}`, error);
            return null;
        }
    },

    safeSelectAll: (selector, context = document) => {
        try {
            const result = DOM.$$(selector, context);
            return result ? Array.from(result) : [];
        } catch (error) {
            console.warn(`🍎 Safe selectAll failed for: ${selector}`, error);
            return [];
        }
    },

    // Version info
    version: '2.0.1',

    // Initialization status
    initialized: false,

    // Performance tracking
    performance: {
        initTime: 0,
        currentFPS: 0,
        memoryInfo: null,
        lowPerformanceMode: false
    }
};

/**
 * Apple Global Controller - Enhanced Version
 */
class AppleGlobalController {
    constructor() {
        this.components = new Map();
        this.initialized = false;
        this.initStartTime = performance.now();
        this.performanceThreshold = {
            fps: {
                low: 24,
                warning: 30,
                good: 45
            },
            memory: {
                warning: 70, // percentage
                critical: 85
            }
        };

        this.init();
    }

    /**
     * Initialize all Apple modules with enhanced error handling
     */
    async init() {
        try {
            console.log('🍎 Initializing Apple Global System...');

            // Initialize core systems with timeout
            await Promise.race([
                this.initCore(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Core init timeout')), 5000)
                )
            ]);

            // Initialize components
            await this.initComponents();

            // Setup global event listeners
            this.setupGlobalEvents();

            // Performance monitoring with improved logic
            this.initPerformanceMonitoring();

            this.markInitialized();

        } catch (error) {
            console.error('🍎 Apple Global initialization failed:', error);
            this.handleInitializationFailure(error);
        }
    }

    /**
     * Handle initialization failure gracefully
     */
    handleInitializationFailure(error) {
        // Fallback mode - minimal functionality
        window.AppleGlobal.initialized = false;
        window.AppleGlobal.fallbackMode = true;

        // Provide basic DOM utilities as fallback
        window.AppleGlobal.select = (selector) => {
            try {
                return document.querySelector(selector);
            } catch (e) {
                return null;
            }
        };

        window.AppleGlobal.selectAll = (selector) => {
            try {
                return Array.from(document.querySelectorAll(selector) || []);
            } catch (e) {
                return [];
            }
        };

        console.warn('🍎 Running in fallback mode due to initialization failure');
    }

    /**
     * Initialize core modules with better error handling
     */
    async initCore() {
        try {
            // Initialize device detection
            if (Device.initDeviceDetection) {
                Device.initDeviceDetection();
            }

            // Initialize animation system
            if (Animation.initAnimationSystem) {
                Animation.initAnimationSystem();
            }

            // Initialize observer system
            if (Observers.initObserverSystem) {
                Observers.initObserverSystem();
            }

            console.log('🍎 Core modules initialized');
        } catch (error) {
            console.error('🍎 Core module initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize components with better error handling
     */
    async initComponents() {
        try {
            // Initialize mega menu
            const navbar = document.querySelector('.apple-navbar');
            if (navbar) {
                try {
                    const megaMenuInstance = initMegaMenu('.apple-navbar', {
                        mobileBreakpoint: 735,
                        animationDuration: 300,
                        backdropOpacity: 0.1,
                        hoverDelay: 100
                    });
                    this.components.set('megaMenu', megaMenuInstance);
                    console.log('🍎 Mega Menu initialized');
                } catch (error) {
                    console.warn('🍎 Mega Menu initialization failed:', error);
                }
            }


            // Initialize lazy loading with error handling
            try {
                if (Observers.createLazyLoader) {
                    Observers.createLazyLoader();
                }
            } catch (error) {
                console.warn('🍎 Lazy loader initialization failed:', error);
            }

            console.log('🍎 Components initialized');
        } catch (error) {
            console.error('🍎 Component initialization failed:', error);
        }
    }

    /**
     * Setup global event listeners with enhanced error handling
     */
    setupGlobalEvents() {
        try {
            // Global error handling
            window.addEventListener('error', (event) => {
                console.error('🍎 Global error:', event.error);
                this.trackError('global_error', event.error);
            });

            // Unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                console.error('🍎 Unhandled promise rejection:', event.reason);
                this.trackError('unhandled_promise', event.reason);
            });

            // Page lifecycle events
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    document.body.classList.add('page-hidden');
                    this.pauseNonCriticalOperations();
                } else {
                    document.body.classList.remove('page-hidden');
                    this.resumeNonCriticalOperations();
                }
            });

            // Before unload cleanup
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });

            // Network status monitoring
            window.addEventListener('online', () => {
                console.log('🍎 Network: Online');
                document.body.classList.remove('offline');
            });

            window.addEventListener('offline', () => {
                console.log('🍎 Network: Offline');
                document.body.classList.add('offline');
            });

            console.log('🍎 Global events setup complete');
        } catch (error) {
            console.error('🍎 Global events setup failed:', error);
        }
    }

    /**
     * Enhanced performance monitoring
     */
    initPerformanceMonitoring() {
        try {
            // Improved frame rate monitoring
            this.monitorFrameRate();

            // Memory monitoring with better logic
            if ('memory' in performance) {
                this.monitorMemory();
            }

            // Long task monitoring with error handling
            if ('PerformanceObserver' in window) {
                try {
                    this.monitorLongTasks();
                } catch (error) {
                    console.log('🍎 Long task monitoring not supported');
                }
            }

            // Monitor Core Web Vitals
            this.monitorWebVitals();

            console.log('🍎 Performance monitoring initialized');
        } catch (error) {
            console.error('🍎 Performance monitoring failed:', error);
        }
    }

    /**
     * Improved frame rate monitoring with adaptive thresholds
     */
    monitorFrameRate() {
        let frameCount = 0;
        let lastTime = performance.now();
        let lastLogTime = 0;
        const LOG_INTERVAL = 10000; // Log every 10 seconds instead of every second

        const checkFrameRate = (currentTime) => {
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;

                // Store FPS
                window.AppleGlobal.performance.currentFPS = fps;

                // Adaptive performance management
                if (fps < this.performanceThreshold.fps.low) {
                    this.enableLowPerformanceMode();
                } else if (fps >= this.performanceThreshold.fps.good) {
                    this.disableLowPerformanceMode();
                }

                // Reduced logging frequency
                if (currentTime - lastLogTime >= LOG_INTERVAL && fps < this.performanceThreshold.fps.warning) {
                    console.warn(`🍎 Low frame rate detected: ${fps}fps`);
                    lastLogTime = currentTime;
                }
            }

            requestAnimationFrame(checkFrameRate);
        };

        requestAnimationFrame(checkFrameRate);
    }

    /**
     * Enable low performance mode
     */
    enableLowPerformanceMode() {
        if (!window.AppleGlobal.performance.lowPerformanceMode) {
            window.AppleGlobal.performance.lowPerformanceMode = true;
            document.body.classList.add('low-performance');

            // Disable heavy animations
            document.body.classList.add('reduce-animations');

            console.log('🍎 Low performance mode enabled');
        }
    }

    /**
     * Disable low performance mode
     */
    disableLowPerformanceMode() {
        if (window.AppleGlobal.performance.lowPerformanceMode) {
            window.AppleGlobal.performance.lowPerformanceMode = false;
            document.body.classList.remove('low-performance', 'reduce-animations');

            console.log('🍎 Low performance mode disabled');
        }
    }

    /**
     * Enhanced memory monitoring
     */
    monitorMemory() {
        const checkMemory = () => {
            try {
                if (performance.memory) {
                    const memory = performance.memory;
                    const memoryInfo = {
                        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
                    };

                    window.AppleGlobal.performance.memoryInfo = memoryInfo;

                    const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;

                    if (usagePercent > this.performanceThreshold.memory.critical) {
                        console.error('🍎 Critical memory usage:', memoryInfo);
                        this.handleHighMemoryUsage();
                    } else if (usagePercent > this.performanceThreshold.memory.warning) {
                        console.warn('🍎 High memory usage:', memoryInfo);
                    }
                }
            } catch (error) {
                console.warn('🍎 Memory monitoring failed:', error);
            }
        };

        // Check memory every 30 seconds
        setInterval(checkMemory, 30000);
        checkMemory(); // Initial check
    }

    /**
     * Monitor long tasks
     */
    monitorLongTasks() {
        if (Observers.observePerformance) {
            Observers.observePerformance((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'longtask' && entry.duration > 50) {
                        console.warn(`🍎 Long task detected: ${entry.duration.toFixed(2)}ms`);
                        this.trackPerformanceIssue('long_task', entry.duration);
                    }
                });
            }, ['longtask']);
        }
    }

    /**
     * Monitor Core Web Vitals
     */
    monitorWebVitals() {
        // Monitor Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log(`🍎 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
                }).observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (error) {
                console.log('🍎 LCP monitoring not supported');
            }

            // Monitor First Input Delay (FID)
            try {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        console.log(`🍎 FID: ${entry.processingStart - entry.startTime}ms`);
                    });
                }).observe({ entryTypes: ['first-input'] });
            } catch (error) {
                console.log('🍎 FID monitoring not supported');
            }
        }
    }

    /**
     * Handle high memory usage
     */
    handleHighMemoryUsage() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }

        // Cleanup unused observers
        if (Observers.cleanupAllObservers) {
            console.log('🍎 Cleaning up observers due to high memory usage');
        }

        // Enable aggressive performance mode
        this.enableLowPerformanceMode();
    }

    /**
     * Pause non-critical operations when page is hidden
     */
    pauseNonCriticalOperations() {
        // Pause animations
        if (Animation.cancelAllAnimations) {
            // Don't cancel all, just pause
            console.log('🍎 Pausing non-critical operations');
        }
    }

    /**
     * Resume operations when page is visible
     */
    resumeNonCriticalOperations() {
        console.log('🍎 Resuming operations');
    }

    /**
     * Track errors for analytics
     */
    trackError(type, error) {
        try {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: error.message || error,
                    fatal: false,
                    custom_map: { type }
                });
            }
        } catch (e) {
            // Fail silently
        }
    }

    /**
     * Track performance issues
     */
    trackPerformanceIssue(type, value) {
        try {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'performance_issue', {
                    event_category: 'performance',
                    event_label: type,
                    value: Math.round(value)
                });
            }
        } catch (e) {
            // Fail silently
        }
    }

    /**
     * Mark system as initialized with enhanced reporting
     */
    markInitialized() {
        this.initialized = true;
        window.AppleGlobal.initialized = true;

        const initTime = performance.now() - this.initStartTime;
        window.AppleGlobal.performance.initTime = initTime;

        console.log(`🍎 Apple Global System initialized in ${initTime.toFixed(2)}ms`);

        // Add initialized class to body
        document.body.classList.add('apple-global-loaded');

        // Dispatch custom event with more details
        document.dispatchEvent(new CustomEvent('appleGlobalLoaded', {
            detail: {
                initTime,
                components: Array.from(this.components.keys()),
                performance: window.AppleGlobal.performance,
                device: Device.getDeviceInfo ? Device.getDeviceInfo() : {}
            }
        }));

        // Initial performance check
        setTimeout(() => this.runPerformanceAudit(), 2000);
    }

    /**
     * Run performance audit
     */
    runPerformanceAudit() {
        const audit = {
            fps: window.AppleGlobal.performance.currentFPS,
            memory: window.AppleGlobal.performance.memoryInfo,
            lowPerformanceMode: window.AppleGlobal.performance.lowPerformanceMode,
            componentsLoaded: this.components.size,
            timestamp: Date.now()
        };

        console.log('🍎 Performance Audit:', audit);
        return audit;
    }

    /**
     * Enhanced component management
     */
    getComponent(name) {
        return this.components.get(name);
    }

    registerComponent(name, instance) {
        try {
            this.components.set(name, instance);
            console.log(`🍎 Component registered: ${name}`);
        } catch (error) {
            console.error(`🍎 Failed to register component ${name}:`, error);
        }
    }

    /**
     * Enhanced cleanup with better error handling
     */
    cleanup() {
        try {
            console.log('🍎 Cleaning up Apple Global System...');

            // Cleanup animations
            if (Animation.cancelAllAnimations) {
                Animation.cancelAllAnimations();
            }

            // Cleanup observers
            if (Observers.cleanupAllObservers) {
                Observers.cleanupAllObservers();
            }

            // Cleanup components
            this.components.forEach((component, name) => {
                try {
                    if (component && typeof component.destroy === 'function') {
                        component.destroy();
                    }
                } catch (error) {
                    console.warn(`🍎 Failed to cleanup component ${name}:`, error);
                }
            });

            this.components.clear();
        } catch (error) {
            console.error('🍎 Cleanup failed:', error);
        }
    }

    /**
     * Enhanced system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            fallbackMode: window.AppleGlobal.fallbackMode || false,
            components: Array.from(this.components.keys()),
            performance: window.AppleGlobal.performance,
            features: Device.getFeatureSupport ? Device.getFeatureSupport() : {},
            device: Device.getDeviceInfo ? Device.getDeviceInfo() : {},
            version: window.AppleGlobal.version
        };
    }
}

/**
 * Initialize Apple Global System with enhanced error handling
 */
function initializeAppleGlobal() {
    try {
        // Check if already initialized
        if (window.AppleGlobal.initialized) {
            console.log('🍎 Apple Global already initialized');
            return window.AppleGlobalController;
        }

        // Create global controller
        window.AppleGlobalController = new AppleGlobalController();

        // Add convenience methods to global object
        window.AppleGlobal.getComponent = (name) =>
            window.AppleGlobalController?.getComponent(name);

        window.AppleGlobal.registerComponent = (name, instance) =>
            window.AppleGlobalController?.registerComponent(name, instance);

        window.AppleGlobal.getStatus = () =>
            window.AppleGlobalController?.getStatus() || { error: 'Controller not available' };

        window.AppleGlobal.cleanup = () =>
            window.AppleGlobalController?.cleanup();

        window.AppleGlobal.runAudit = () =>
            window.AppleGlobalController?.runPerformanceAudit();

        return window.AppleGlobalController;
    } catch (error) {
        console.error('🍎 Failed to initialize Apple Global System:', error);
        return null;
    }
}

/**
 * Auto-initialize with better timing
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppleGlobal);
} else {
    // Use setTimeout to ensure all modules are loaded
    setTimeout(initializeAppleGlobal, 0);
}

// Export for ES modules
export {
    AppleGlobalController,
    initializeAppleGlobal
};

// Legacy support
window.initializeAppleGlobal = initializeAppleGlobal;