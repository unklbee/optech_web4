// js/core/observers.js

/**
 * Observer System Module
 * Provides optimized intersection, resize, and mutation observers
 */

/**
 * Observer instances storage
 */
const observerInstances = new Map();

/**
 * Enhanced Intersection Observer with Apple-optimized defaults
 * @param {Element|NodeList} elements - Elements to observe
 * @param {Function} callback - Callback function
 * @param {Object} options - Observer options
 * @returns {Object} Observer controller
 */
export function observeIntersection(elements, callback, options = {}) {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    };

    const config = { ...defaultOptions, ...options };
    const elementList = elements.length ? Array.from(elements) : [elements];

    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        console.warn('IntersectionObserver not supported, using fallback');
        elementList.forEach(element => {
            if (element) {
                callback([{ target: element, isIntersecting: true }]);
            }
        });
        return { disconnect: () => {}, unobserve: () => {} };
    }

    const observer = new IntersectionObserver((entries) => {
        // Filter only intersecting entries for performance
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        if (intersectingEntries.length > 0) {
            callback(intersectingEntries);
        }
    }, config);

    elementList.forEach(element => {
        if (element) {
            observer.observe(element);
        }
    });

    const observerId = `intersection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    observerInstances.set(observerId, observer);

    return {
        disconnect: () => {
            observer.disconnect();
            observerInstances.delete(observerId);
        },
        unobserve: (element) => {
            observer.unobserve(element);
        },
        observe: (element) => {
            observer.observe(element);
        }
    };
}

/**
 * Lazy loading observer for images and media
 * @param {string} selector - Selector for elements to lazy load
 * @param {Object} options - Lazy loading options
 * @returns {Object} Observer controller
 */
export function createLazyLoader(selector = 'img[data-src], video[data-src]', options = {}) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return { disconnect: () => {} };

    const {
        rootMargin = '50px 0px',
        threshold = 0.01,
        fadeIn = true,
        fadeInDuration = 300
    } = options;

    const loadElement = (element) => {
        const src = element.dataset.src;
        const srcset = element.dataset.srcset;

        if (!src) return;

        // Set loading state
        element.classList.add('loading');

        if (fadeIn) {
            element.style.opacity = '0';
            element.style.transition = `opacity ${fadeInDuration}ms cubic-bezier(0.4, 0, 0.6, 1)`;
        }

        const imageLoader = new Image();

        imageLoader.onload = () => {
            // Update src attributes
            element.src = src;
            if (srcset) element.srcset = srcset;

            // Remove data attributes
            delete element.dataset.src;
            if (srcset) delete element.dataset.srcset;

            // Update classes
            element.classList.remove('loading');
            element.classList.add('loaded');

            if (fadeIn) {
                element.style.opacity = '1';
            }
        };

        imageLoader.onerror = () => {
            element.classList.remove('loading');
            element.classList.add('error');

            if (fadeIn) {
                element.style.opacity = '1';
            }
        };

        imageLoader.src = src;
        if (srcset) imageLoader.srcset = srcset;
    };

    return observeIntersection(elements, (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadElement(entry.target);
                // Stop observing this element
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin, threshold });
}

/**
 * Resize observer with debounced callback
 * @param {Element|NodeList} elements - Elements to observe
 * @param {Function} callback - Callback function
 * @param {Object} options - Observer options
 * @returns {Object} Observer controller
 */
export function observeResize(elements, callback, options = {}) {
    const { debounce = 16 } = options;
    const elementList = elements.length ? Array.from(elements) : [elements];

    if (!('ResizeObserver' in window)) {
        console.warn('ResizeObserver not supported');
        return { disconnect: () => {}, unobserve: () => {} };
    }

    let timeoutId = null;

    const debouncedCallback = (entries) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback(entries);
        }, debounce);
    };

    const observer = new ResizeObserver(debouncedCallback);

    elementList.forEach(element => {
        if (element) {
            observer.observe(element);
        }
    });

    const observerId = `resize-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    observerInstances.set(observerId, observer);

    return {
        disconnect: () => {
            clearTimeout(timeoutId);
            observer.disconnect();
            observerInstances.delete(observerId);
        },
        unobserve: (element) => {
            observer.unobserve(element);
        },
        observe: (element) => {
            observer.observe(element);
        }
    };
}

/**
 * Mutation observer for DOM changes
 * @param {Element} target - Target element to observe
 * @param {Function} callback - Callback function
 * @param {Object} options - Observer options
 * @returns {Object} Observer controller
 */
export function observeMutations(target, callback, options = {}) {
    if (!target) {
        console.warn('Target element is required for mutation observer');
        return { disconnect: () => {} };
    }

    const defaultOptions = {
        childList: true,
        subtree: true,
        attributes: false,
        attributeOldValue: false,
        characterData: false,
        characterDataOldValue: false
    };

    const config = { ...defaultOptions, ...options };

    const observer = new MutationObserver(callback);
    observer.observe(target, config);

    const observerId = `mutation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    observerInstances.set(observerId, observer);

    return {
        disconnect: () => {
            observer.disconnect();
            observerInstances.delete(observerId);
        }
    };
}

/**
 * Scroll progress observer (Apple-style)
 * @param {Element} element - Element to track scroll progress
 * @param {Function} callback - Callback with progress (0-1)
 * @param {Object} options - Observer options
 * @returns {Function} Cleanup function
 */
export function observeScrollProgress(element, callback, options = {}) {
    if (!element) return () => {};

    const {
        threshold = 0.1,
        rootMargin = '0px',
        throttle = 16
    } = options;

    let ticking = false;

    const updateProgress = () => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate progress based on element position
        const elementTop = rect.top;
        const elementHeight = rect.height;

        let progress = 0;

        if (elementTop < windowHeight && elementTop + elementHeight > 0) {
            if (elementTop <= 0) {
                // Element is partially or fully above viewport
                progress = Math.min(Math.abs(elementTop) / elementHeight, 1);
            } else {
                // Element is entering viewport from bottom
                progress = (windowHeight - elementTop) / windowHeight;
            }
        }

        progress = Math.max(0, Math.min(1, progress));
        callback(progress, element);
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    };

    // Use intersection observer to enable/disable scroll listener
    const intersectionObserver = observeIntersection(element, (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                window.addEventListener('scroll', onScroll, { passive: true });
                updateProgress(); // Initial call
            } else {
                window.removeEventListener('scroll', onScroll);
            }
        });
    }, { threshold, rootMargin });

    return () => {
        window.removeEventListener('scroll', onScroll);
        intersectionObserver.disconnect();
    };
}

/**
 * Viewport change observer
 * @param {Function} callback - Callback function
 * @param {Object} options - Observer options
 * @returns {Function} Cleanup function
 */
export function observeViewport(callback, options = {}) {
    const { debounce = 100 } = options;
    let timeoutId = null;

    const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: window.innerWidth <= 734,
                isTablet: window.innerWidth > 734 && window.innerWidth <= 1067,
                isDesktop: window.innerWidth > 1067,
                orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
            };
            callback(viewport);
        }, debounce);
    };

    const handleOrientationChange = () => {
        setTimeout(handleResize, 100); // Delay for orientation change
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial call
    handleResize();

    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
    };
}

/**
 * Performance observer for monitoring page performance
 * @param {Function} callback - Callback function
 * @param {Array} entryTypes - Performance entry types to observe
 * @returns {Object} Observer controller
 */
export function observePerformance(callback, entryTypes = ['measure', 'navigation']) {
    if (!('PerformanceObserver' in window)) {
        console.warn('PerformanceObserver not supported');
        return { disconnect: () => {} };
    }

    const observer = new PerformanceObserver(callback);

    try {
        observer.observe({ entryTypes });
    } catch (error) {
        console.warn('Some performance entry types not supported:', error);
        return { disconnect: () => {} };
    }

    const observerId = `performance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    observerInstances.set(observerId, observer);

    return {
        disconnect: () => {
            observer.disconnect();
            observerInstances.delete(observerId);
        }
    };
}

/**
 * Visibility change observer
 * @param {Function} callback - Callback function with visibility state
 * @returns {Function} Cleanup function
 */
export function observeVisibility(callback) {
    const handleVisibilityChange = () => {
        callback({
            isVisible: !document.hidden,
            visibilityState: document.visibilityState
        });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial call
    handleVisibilityChange();

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}

/**
 * Cleanup all observers
 */
export function cleanupAllObservers() {
    observerInstances.forEach(observer => {
        if (observer && observer.disconnect) {
            observer.disconnect();
        }
    });
    observerInstances.clear();
}

/**
 * Initialize observer system
 */
export function initObserverSystem() {
    // Cleanup observers on page unload
    window.addEventListener('beforeunload', cleanupAllObservers);

    // Initialize lazy loading for existing images
    createLazyLoader();

    console.log('🍎 Observer system initialized');
}