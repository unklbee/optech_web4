// js/core/utils.js

/**
 * Core Utilities Module
 * Provides essential utility functions following Apple design principles
 */

export const APPLE_EASING = 'cubic-bezier(0.4, 0, 0.6, 1)';

/**
 * Performance-optimized debounce with Apple timing
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds (default: 16ms for 60fps)
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 16, immediate = false) {
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
 * Throttle function for scroll events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 16) {
    let lastFunc;
    let lastRan;

    return function executedFunction(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

/**
 * Enhanced requestAnimationFrame with fallback
 * @param {Function} callback - Animation callback
 * @returns {number} Animation frame ID
 */
export function raf(callback) {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) { return setTimeout(callback, 1000 / 60); }
    )(callback);
}

/**
 * Cancel animation frame with fallback
 * @param {number} id - Animation frame ID
 */
export function cancelRaf(id) {
    return (
        window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        clearTimeout
    )(id);
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} progress - Progress (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, progress) {
    return start + (end - start) * progress;
}

/**
 * Easing functions collection
 */
export const easings = {
    linear: t => t,
    easeOut: t => 1 - Math.pow(1 - t, 3),
    easeIn: t => t * t * t,
    easeInOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    apple: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
};

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'apple') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if value is null or undefined
 * @param {*} value - Value to check
 * @returns {boolean} Is null or undefined
 */
export function isNullish(value) {
    return value === null || value === undefined;
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

/**
 * Check if value is object
 * @param {*} item - Item to check
 * @returns {boolean} Is object
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}