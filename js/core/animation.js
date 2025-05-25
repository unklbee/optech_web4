// js/core/animation.js

import { APPLE_EASING, easings, raf, cancelRaf, clamp, lerp } from './utils.js';
import { prefersReducedMotion } from './device.js';

/**
 * Animation System Module
 * Provides Apple-style animations with performance optimization
 */

/**
 * Animation store for managing active animations
 */
const activeAnimations = new Map();

/**
 * Default animation options
 */
const defaultOptions = {
    duration: 300,
    easing: 'apple',
    fill: 'forwards'
};

/**
 * Smooth scroll to element with Apple-style easing
 * @param {Element|string} target - Target element or selector
 * @param {Object} options - Scroll options
 * @returns {Promise} Promise that resolves when scroll completes
 */
export function scrollToElement(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return Promise.reject(new Error('Target element not found'));

    const {
        duration = 600,
        easing = 'apple',
        offset = 0,
        behavior = 'smooth'
    } = options;

    // Use native smooth scroll if reduced motion is preferred
    if (prefersReducedMotion() || (CSS.supports('scroll-behavior', 'smooth') && behavior === 'smooth')) {
        const targetPosition = element.offsetTop + offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        return Promise.resolve();
    }

    return animateScroll(element.offsetTop + offset, duration, easing);
}

/**
 * Animate scroll position
 * @param {number} targetPosition - Target scroll position
 * @param {number} duration - Animation duration
 * @param {string} easing - Easing function name
 * @returns {Promise} Promise that resolves when animation completes
 */
export function animateScroll(targetPosition, duration = 600, easing = 'apple') {
    return new Promise((resolve) => {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        let animationId = null;

        function animate(currentTime) {
            if (startTime === null) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = clamp(elapsed / duration, 0, 1);

            const easedProgress = easings[easing] ? easings[easing](progress) : progress;
            const currentPosition = startPosition + (distance * easedProgress);

            window.scrollTo(0, currentPosition);

            if (progress < 1) {
                animationId = raf(animate);
            } else {
                resolve();
            }
        }

        animationId = raf(animate);

        // Store animation for potential cancellation
        const animationKey = `scroll-${Date.now()}`;
        activeAnimations.set(animationKey, {
            cancel: () => {
                if (animationId) {
                    cancelRaf(animationId);
                    resolve();
                }
            }
        });
    });
}

/**
 * Animate element properties with Web Animations API fallback
 * @param {Element} element - Target element
 * @param {Object} keyframes - Animation keyframes
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
export function animateElement(element, keyframes, options = {}) {
    if (!element) return Promise.reject(new Error('Element is required'));

    const config = { ...defaultOptions, ...options };

    // Check for reduced motion preference
    if (prefersReducedMotion()) {
        // Apply final state immediately
        const finalFrame = Array.isArray(keyframes) ? keyframes[keyframes.length - 1] : keyframes;
        Object.assign(element.style, finalFrame);
        return Promise.resolve();
    }

    // Use Web Animations API if available
    if (element.animate && typeof element.animate === 'function') {
        return element.animate(keyframes, {
            duration: config.duration,
            easing: config.easing === 'apple' ? APPLE_EASING : config.easing,
            fill: config.fill
        }).finished;
    }

    // Fallback to manual animation
    return manualAnimate(element, keyframes, config);
}

/**
 * Manual animation fallback
 * @param {Element} element - Target element
 * @param {Object} keyframes - Animation keyframes
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
function manualAnimate(element, keyframes, options) {
    return new Promise((resolve, reject) => {
        if (!element) {
            reject(new Error('Element is required'));
            return;
        }

        const { duration, easing } = options;
        const startTime = performance.now();
        let animationId = null;

        // Get initial styles
        const initialStyles = {};
        const targetStyles = Array.isArray(keyframes) ? keyframes[keyframes.length - 1] : keyframes;

        Object.keys(targetStyles).forEach(prop => {
            initialStyles[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
        });

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = clamp(elapsed / duration, 0, 1);

            const easedProgress = easings[easing] ? easings[easing](progress) : progress;

            // Apply interpolated styles
            Object.keys(targetStyles).forEach(prop => {
                const startValue = initialStyles[prop];
                const endValue = parseFloat(targetStyles[prop]);
                const currentValue = lerp(startValue, endValue, easedProgress);

                if (prop.includes('transform')) {
                    element.style[prop] = targetStyles[prop];
                } else {
                    element.style[prop] = `${currentValue}${getUnit(targetStyles[prop])}`;
                }
            });

            if (progress < 1) {
                animationId = raf(animate);
            } else {
                resolve();
            }
        }

        animationId = raf(animate);

        // Store animation for potential cancellation
        const animationKey = `element-${Date.now()}`;
        activeAnimations.set(animationKey, {
            cancel: () => {
                if (animationId) {
                    cancelRaf(animationId);
                    resolve();
                }
            }
        });
    });
}

/**
 * Get CSS unit from value string
 * @param {string} value - CSS value
 * @returns {string} CSS unit
 */
function getUnit(value) {
    const match = value.toString().match(/[a-zA-Z%]+$/);
    return match ? match[0] : '';
}

/**
 * Fade in element
 * @param {Element} element - Target element
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
export function fadeIn(element, options = {}) {
    if (!element) return Promise.resolve();

    element.style.opacity = '0';
    element.style.display = element.style.display || 'block';

    return animateElement(element, [
        { opacity: 0 },
        { opacity: 1 }
    ], { duration: 300, ...options });
}

/**
 * Fade out element
 * @param {Element} element - Target element
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
export function fadeOut(element, options = {}) {
    if (!element) return Promise.resolve();

    return animateElement(element, [
        { opacity: 1 },
        { opacity: 0 }
    ], { duration: 300, ...options }).then(() => {
        if (options.hide !== false) {
            element.style.display = 'none';
        }
    });
}

/**
 * Slide down element (Apple-style)
 * @param {Element} element - Target element
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
export function slideDown(element, options = {}) {
    if (!element) return Promise.resolve();

    const originalHeight = element.scrollHeight;
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.display = element.style.display || 'block';

    return animateElement(element, [
        { height: '0px', opacity: 0 },
        { height: `${originalHeight}px`, opacity: 1 }
    ], { duration: 400, easing: 'apple', ...options }).then(() => {
        element.style.height = '';
        element.style.overflow = '';
    });
}

/**
 * Slide up element (Apple-style)
 * @param {Element} element - Target element
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
export function slideUp(element, options = {}) {
    if (!element) return Promise.resolve();

    const originalHeight = element.scrollHeight;
    element.style.height = `${originalHeight}px`;
    element.style.overflow = 'hidden';

    return animateElement(element, [
        { height: `${originalHeight}px`, opacity: 1 },
        { height: '0px', opacity: 0 }
    ], { duration: 400, easing: 'apple', ...options }).then(() => {
        if (options.hide !== false) {
            element.style.display = 'none';
        }
        element.style.height = '';
        element.style.overflow = '';
    });
}

/**
 * Scale animation (Apple-style)
 * @param {Element} element - Target element
 * @param {number} scale - Target scale
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
export function scaleElement(element, scale = 1, options = {}) {
    if (!element) return Promise.resolve();

    return animateElement(element, [
        { transform: element.style.transform || 'scale(1)' },
        { transform: `scale(${scale})` }
    ], { duration: 200, easing: 'apple', ...options });
}

/**
 * Staggered animation for multiple elements
 * @param {NodeList|Array} elements - Elements to animate
 * @param {Object} keyframes - Animation keyframes
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when all animations complete
 */
export function staggerAnimation(elements, keyframes, options = {}) {
    const { stagger = 100, ...animationOptions } = options;

    const animations = Array.from(elements).map((element, index) => {
        return new Promise(resolve => {
            setTimeout(() => {
                animateElement(element, keyframes, animationOptions).then(resolve);
            }, index * stagger);
        });
    });

    return Promise.all(animations);
}

/**
 * Entrance animation for elements (Apple-style fade up)
 * @param {Element|NodeList} elements - Elements to animate
 * @param {Object} options - Animation options
 * @returns {Promise} Promise that resolves when animation completes
 */
export function entranceAnimation(elements, options = {}) {
    const elementList = elements.length ? Array.from(elements) : [elements];

    // Set initial state
    elementList.forEach(element => {
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(40px)';
            element.style.willChange = 'transform, opacity';
        }
    });

    const keyframes = [
        { opacity: 0, transform: 'translateY(40px)' },
        { opacity: 1, transform: 'translateY(0)' }
    ];

    return staggerAnimation(elementList, keyframes, {
        duration: 600,
        easing: 'apple',
        stagger: 150,
        ...options
    }).then(() => {
        // Clean up will-change
        elementList.forEach(element => {
            if (element) {
                element.style.willChange = 'auto';
            }
        });
    });
}

/**
 * Parallax animation controller
 * @param {Element} element - Element to animate
 * @param {Object} options - Parallax options
 * @returns {Function} Cleanup function
 */
export function createParallax(element, options = {}) {
    if (!element || prefersReducedMotion()) {
        return () => {};
    }

    const {
        speed = 0.5,
        direction = 'vertical',
        offset = 0
    } = options;

    let ticking = false;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        const windowHeight = window.innerHeight;

        // Check if element is in view
        if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
            const yPos = (scrolled - elementTop + offset) * speed;

            if (direction === 'vertical') {
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            } else {
                element.style.transform = `translate3d(${yPos}px, 0, 0)`;
            }
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            raf(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
        window.removeEventListener('scroll', onScroll);
        if (element) {
            element.style.transform = '';
        }
    };
}

/**
 * Apple-style page transition
 * @param {Function} callback - Function to execute during transition
 * @param {Object} options - Transition options
 * @returns {Promise} Promise that resolves when transition completes
 */
export function pageTransition(callback, options = {}) {
    const {
        duration = 500,
        overlay = true
    } = options;

    const transitionElement = document.createElement('div');
    transitionElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${overlay ? 'rgba(0, 0, 0, 0.8)' : 'transparent'};
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
    `;

    document.body.appendChild(transitionElement);

    return fadeIn(transitionElement, { duration: duration / 2 })
        .then(() => {
            if (typeof callback === 'function') {
                return callback();
            }
        })
        .then(() => fadeOut(transitionElement, { duration: duration / 2 }))
        .then(() => {
            if (transitionElement.parentNode) {
                transitionElement.parentNode.removeChild(transitionElement);
            }
        });
}

/**
 * Cancel all active animations
 */
export function cancelAllAnimations() {
    activeAnimations.forEach(animation => {
        if (animation.cancel) {
            animation.cancel();
        }
    });
    activeAnimations.clear();
}

/**
 * Cancel specific animation
 * @param {string} animationId - Animation ID to cancel
 */
export function cancelAnimation(animationId) {
    const animation = activeAnimations.get(animationId);
    if (animation && animation.cancel) {
        animation.cancel();
        activeAnimations.delete(animationId);
    }
}

/**
 * Initialize animation system
 */
export function initAnimationSystem() {
    // Clean up animations on page unload
    window.addEventListener('beforeunload', cancelAllAnimations);

    // Pause animations when page is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.body.classList.add('page-hidden');
        } else {
            document.body.classList.remove('page-hidden');
        }
    });

    console.log('🍎 Animation system initialized');
}