// js/core/dom.js

/**
 * DOM Utilities Module
 * Provides safe and efficient DOM manipulation utilities
 */

/**
 * Enhanced querySelector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Search context (default: document)
 * @returns {Element|null} Found element
 */
export function $(selector, context = document) {
    try {
        return context.querySelector(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return null;
    }
}

/**
 * Enhanced querySelectorAll with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Search context (default: document)
 * @returns {NodeList} Found elements
 */
export function $$(selector, context = document) {
    try {
        return context.querySelectorAll(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return [];
    }
}

/**
 * Check if element exists and is visible
 * @param {Element} element - Element to check
 * @returns {boolean} Is element visible
 */
export function isVisible(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
    );
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Visibility threshold (0-1)
 * @returns {boolean} Is in viewport
 */
export function isInViewport(element, threshold = 0) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    if (threshold === 0) {
        return vertInView && horInView;
    }

    const visibleArea = Math.max(0, Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)) *
        Math.max(0, Math.min(rect.right, windowWidth) - Math.max(rect.left, 0));
    const elementArea = rect.width * rect.height;

    return (visibleArea / elementArea) >= threshold;
}

/**
 * Get element's position relative to document
 * @param {Element} element - Target element
 * @returns {Object} Position coordinates
 */
export function getElementPosition(element) {
    if (!element) return { top: 0, left: 0 };

    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
    };
}

/**
 * Get element's center point
 * @param {Element} element - Target element
 * @returns {Object} Center coordinates
 */
export function getElementCenter(element) {
    const pos = getElementPosition(element);
    return {
        x: pos.left + (pos.width / 2),
        y: pos.top + (pos.height / 2)
    };
}

/**
 * Enhanced addEventListener with automatic cleanup
 * @param {Element|Window|Document} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object|boolean} options - Event options
 * @returns {Function} Cleanup function
 */
export function addEvent(element, event, handler, options = {}) {
    if (!element || !event || typeof handler !== 'function') {
        console.warn('Invalid parameters for addEvent');
        return () => {};
    }

    // Support for multiple events
    if (event.includes(' ')) {
        const events = event.split(' ');
        const cleanupFunctions = events.map(evt => addEvent(element, evt, handler, options));
        return () => cleanupFunctions.forEach(cleanup => cleanup());
    }

    element.addEventListener(event, handler, options);

    return () => {
        element.removeEventListener(event, handler, options);
    };
}

/**
 * Delegate event listener
 * @param {Element} parent - Parent element
 * @param {string} selector - Child selector
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @returns {Function} Cleanup function
 */
export function delegate(parent, selector, event, handler) {
    const delegatedHandler = (e) => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) {
            handler.call(target, e);
        }
    };

    return addEvent(parent, event, delegatedHandler);
}

/**
 * Wait for element to exist
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @param {Element} context - Search context
 * @returns {Promise<Element>} Promise resolving to element
 */
export function waitForElement(selector, timeout = 5000, context = document) {
    return new Promise((resolve, reject) => {
        const element = $(selector, context);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = $(selector, context);
            if (element) {
                observer.disconnect();
                clearTimeout(timeoutId);
                resolve(element);
            }
        });

        observer.observe(context, {
            childList: true,
            subtree: true
        });

        const timeoutId = setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

/**
 * Create element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {...(string|Element)} children - Child elements or text
 * @returns {Element} Created element
 */
export function createElement(tag, attributes = {}, ...children) {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2), value);
        } else {
            element.setAttribute(key, value);
        }
    });

    // Add children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
            element.appendChild(child);
        }
    });

    return element;
}

/**
 * Remove element safely
 * @param {Element} element - Element to remove
 */
export function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

/**
 * Get computed style property
 * @param {Element} element - Target element
 * @param {string} property - CSS property name
 * @returns {string} Computed value
 */
export function getStyle(element, property) {
    if (!element) return '';
    return window.getComputedStyle(element).getPropertyValue(property);
}

/**
 * Set multiple styles on element
 * @param {Element} element - Target element
 * @param {Object} styles - Style object
 */
export function setStyles(element, styles) {
    if (!element || !styles) return;

    Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
    });
}

/**
 * Toggle class with optional force parameter
 * @param {Element} element - Target element
 * @param {string} className - Class name to toggle
 * @param {boolean} force - Force add/remove
 * @returns {boolean} Whether class is present after toggle
 */
export function toggleClass(element, className, force) {
    if (!element) return false;

    if (typeof force !== 'undefined') {
        return force ?
            (element.classList.add(className), true) :
            (element.classList.remove(className), false);
    }

    return element.classList.toggle(className);
}

/**
 * Get element's data attributes as object
 * @param {Element} element - Target element
 * @returns {Object} Data attributes object
 */
export function getDataAttributes(element) {
    if (!element) return {};

    const data = {};
    Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
            const key = attr.name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            data[key] = attr.value;
        }
    });

    return data;
}

/**
 * Measure element without affecting layout
 * @param {Element} element - Element to measure
 * @returns {Object} Measurements
 */
export function measureElement(element) {
    if (!element) return { width: 0, height: 0 };

    const clone = element.cloneNode(true);
    setStyles(clone, {
        position: 'absolute',
        visibility: 'hidden',
        top: '-9999px',
        left: '-9999px'
    });

    document.body.appendChild(clone);
    const measurements = {
        width: clone.offsetWidth,
        height: clone.offsetHeight,
        scrollWidth: clone.scrollWidth,
        scrollHeight: clone.scrollHeight
    };

    removeElement(clone);
    return measurements;
}