// js/global.js - Modular Entry Point

/**
 * Apple.com Style Global JavaScript - Modular Version
 * Entry point that orchestrates all modules
 */

// Core modules
import * as Utils from './core/utils.js';
import * as Device from './core/device.js';
import * as DOM from './core/dom.js';
import * as Animation from './core/animation.js';
import * as Observers from './core/observers.js';

// Components
import { AppleNavbar, initNavbar } from './components/navbar.js';

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

    // Selector aliases for easier access
    select: DOM.querySelector,
    selectAll: DOM.querySelectorAll,

    // Version info
    version: '2.0.0',

    // Initialization status
    initialized: false
};

/**
 * Apple Global Controller
 * Manages initialization and coordination of all modules
 */
class AppleGlobalController {
    constructor() {
        this.components = new Map();
        this.initialized = false;
        this.initStartTime = performance.now();

        this.init();
    }

    /**
     * Initialize all Apple modules
     */
    async init() {
        try {
            console.log('🍎 Initializing Apple Global System...');

            // Initialize core systems
            await this.initCore();

            // Initialize components
            await this.initComponents();

            // Setup global event listeners
            this.setupGlobalEvents();

            // Performance monitoring
            this.initPerformanceMonitoring();

            this.markInitialized();

        } catch (error) {
            console.error('🍎 Apple Global initialization failed:', error);
        }
    }

    /**
     * Initialize core modules
     */
    async initCore() {
        // Initialize device detection
        Device.initDeviceDetection();

        // Initialize animation system
        Animation.initAnimationSystem();

        // Initialize observer system
        Observers.initObserverSystem();

        console.log('🍎 Core modules initialized');
    }

    /**
     * Initialize components
     */
    async initComponents() {
        // Auto-initialize navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const navbarInstance = initNavbar('.navbar');
            this.components.set('navbar', navbarInstance);
        }

        // Initialize lazy loading
        Observers.createLazyLoader();

        console.log('🍎 Components initialized');
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEvents() {
        // Global error handling
        window.addEventListener('error', (event) => {
            console.error('🍎 Global error:', event.error);
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🍎 Unhandled promise rejection:', event.reason);
        });

        // Page lifecycle events
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.classList.add('page-hidden');
            } else {
                document.body.classList.remove('page-hidden');
            }
        });

        // Before unload cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        console.log('🍎 Global events setup complete');
    }

    /**
     * Initialize performance monitoring
     */
    initPerformanceMonitoring() {
        // Monitor frame rate
        this.monitorFrameRate();

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            this.monitorMemory();
        }

        // Monitor long tasks (if available)
        if ('PerformanceObserver' in window) {
            try {
                Observers.observePerformance((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'longtask') {
                            console.warn('🍎 Long task detected:', entry.duration + 'ms');
                        }
                    });
                }, ['longtask']);
            } catch (error) {
                console.log('🍎 Long task monitoring not supported');
            }
        }

        console.log('🍎 Performance monitoring initialized');
    }

    /**
     * Monitor frame rate
     */
    monitorFrameRate() {
        let frameCount = 0;
        let lastTime = performance.now();

        const checkFrameRate = (currentTime) => {
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;

                // Add performance classes
                if (fps < 30) {
                    document.body.classList.add('low-performance');
                    console.warn('🍎 Low frame rate detected:', fps + 'fps');
                } else {
                    document.body.classList.remove('low-performance');
                }

                // Store FPS for debugging
                window.AppleGlobal.currentFPS = fps;
            }

            requestAnimationFrame(checkFrameRate);
        };

        requestAnimationFrame(checkFrameRate);
    }

    /**
     * Monitor memory usage
     */
    monitorMemory() {
        const checkMemory = () => {
            if (performance.memory) {
                const memory = performance.memory;
                const memoryInfo = {
                    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
                };

                // Store memory info for debugging
                window.AppleGlobal.memoryInfo = memoryInfo;

                // Warn if memory usage is high
                const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
                if (usagePercent > 80) {
                    console.warn('🍎 High memory usage:', memoryInfo);
                }
            }
        };

        // Check memory every 30 seconds
        setInterval(checkMemory, 30000);
        checkMemory(); // Initial check
    }

    /**
     * Mark system as initialized
     */
    markInitialized() {
        this.initialized = true;
        window.AppleGlobal.initialized = true;

        const initTime = performance.now() - this.initStartTime;
        console.log(`🍎 Apple Global System initialized in ${initTime.toFixed(2)}ms`);

        // Add initialized class to body
        document.body.classList.add('apple-global-loaded');

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('appleGlobalLoaded', {
            detail: {
                initTime,
                components: Array.from(this.components.keys())
            }
        }));
    }

    /**
     * Get component instance
     */
    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * Register component
     */
    registerComponent(name, instance) {
        this.components.set(name, instance);
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        console.log('🍎 Cleaning up Apple Global System...');

        // Cleanup animations
        Animation.cancelAllAnimations();

        // Cleanup observers
        Observers.cleanupAllObservers();

        // Cleanup components
        this.components.forEach((component, name) => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        this.components.clear();
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            components: Array.from(this.components.keys()),
            performance: {
                fps: window.AppleGlobal.currentFPS || 'unknown',
                memory: window.AppleGlobal.memoryInfo || 'unknown'
            },
            features: Device.getFeatureSupport(),
            device: Device.getDeviceInfo()
        };
    }
}

/**
 * Initialize Apple Global System
 */
function initializeAppleGlobal() {
    // Check if already initialized
    if (window.AppleGlobal.initialized) {
        console.log('🍎 Apple Global already initialized');
        return;
    }

    // Create global controller
    window.AppleGlobalController = new AppleGlobalController();

    // Add convenience methods to global object
    window.AppleGlobal.getComponent = (name) =>
        window.AppleGlobalController.getComponent(name);

    window.AppleGlobal.registerComponent = (name, instance) =>
        window.AppleGlobalController.registerComponent(name, instance);

    window.AppleGlobal.getStatus = () =>
        window.AppleGlobalController.getStatus();

    window.AppleGlobal.cleanup = () =>
        window.AppleGlobalController.cleanup();
}

/**
 * Auto-initialize based on document ready state
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppleGlobal);
} else {
    // DOM is already ready
    initializeAppleGlobal();
}

// Export for ES modules
export {
    AppleGlobalController,
    initializeAppleGlobal
};

// Legacy support
window.initializeAppleGlobal = initializeAppleGlobal;