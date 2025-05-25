// js/core/device.js

/**
 * Device Detection Module
 * Provides comprehensive device and environment detection
 */

/**
 * User agent detection cache
 */
let cachedUserAgent = null;
let cachedDeviceInfo = null;

/**
 * Get user agent string
 * @returns {string} User agent string
 */
function getUserAgent() {
    if (!cachedUserAgent) {
        cachedUserAgent = navigator.userAgent.toLowerCase();
    }
    return cachedUserAgent;
}

/**
 * Check if device is iOS
 * @returns {boolean} Is iOS device
 */
export function isIOS() {
    const ua = getUserAgent();
    return /ipad|iphone|ipod/.test(ua) && !window.MSStream;
}

/**
 * Check if device is macOS
 * @returns {boolean} Is macOS device
 */
export function isMacOS() {
    return navigator.platform.toLowerCase().includes('mac');
}

/**
 * Check if device is Windows
 * @returns {boolean} Is Windows device
 */
export function isWindows() {
    return navigator.platform.toLowerCase().includes('win');
}

/**
 * Check if device is Android
 * @returns {boolean} Is Android device
 */
export function isAndroid() {
    return getUserAgent().includes('android');
}

/**
 * Check if device supports touch
 * @returns {boolean} Has touch support
 */
export function isTouchDevice() {
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
}

/**
 * Check if device is mobile
 * @returns {boolean} Is mobile device
 */
export function isMobile() {
    return window.innerWidth <= 734;
}

/**
 * Check if device is tablet
 * @returns {boolean} Is tablet device
 */
export function isTablet() {
    return window.innerWidth > 734 && window.innerWidth <= 1067;
}

/**
 * Check if device is desktop
 * @returns {boolean} Is desktop device
 */
export function isDesktop() {
    return window.innerWidth > 1067;
}

/**
 * Get device pixel ratio
 * @returns {number} Device pixel ratio
 */
export function getPixelRatio() {
    return window.devicePixelRatio || 1;
}

/**
 * Check if device has high DPI
 * @returns {boolean} Has high DPI
 */
export function isHighDPI() {
    return getPixelRatio() > 1.5;
}

/**
 * Get viewport dimensions and device info
 * @returns {Object} Viewport and device information
 */
export function getViewport() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
        width,
        height,
        isMobile: width <= 734,
        isTablet: width > 734 && width <= 1067,
        isDesktop: width > 1067,
        aspectRatio: width / height,
        orientation: width > height ? 'landscape' : 'portrait'
    };
}

/**
 * Get comprehensive device information
 * @returns {Object} Device information
 */
export function getDeviceInfo() {
    if (!cachedDeviceInfo) {
        const viewport = getViewport();

        cachedDeviceInfo = {
            ...viewport,
            isIOS: isIOS(),
            isMacOS: isMacOS(),
            isWindows: isWindows(),
            isAndroid: isAndroid(),
            isTouch: isTouchDevice(),
            pixelRatio: getPixelRatio(),
            isHighDPI: isHighDPI(),
            platform: navigator.platform,
            userAgent: getUserAgent(),
            language: navigator.language,
            online: navigator.onLine
        };
    }

    return cachedDeviceInfo;
}

/**
 * Check if device supports specific features
 * @returns {Object} Feature support object
 */
export function getFeatureSupport() {
    return {
        intersectionObserver: 'IntersectionObserver' in window,
        resizeObserver: 'ResizeObserver' in window,
        mutationObserver: 'MutationObserver' in window,
        webGL: !!window.WebGLRenderingContext,
        webGL2: !!window.WebGL2RenderingContext,
        webp: checkWebPSupport(),
        avif: checkAVIFSupport(),
        css: {
            grid: CSS.supports('display', 'grid'),
            flexbox: CSS.supports('display', 'flex'),
            customProperties: CSS.supports('color', 'var(--test)'),
            backdropFilter: CSS.supports('backdrop-filter', 'blur(1px)'),
            scrollBehavior: CSS.supports('scroll-behavior', 'smooth')
        },
        animations: {
            requestAnimationFrame: 'requestAnimationFrame' in window,
            webAnimations: 'animate' in document.createElement('div'),
            cssAnimations: CSS.supports('animation-name', 'test')
        }
    };
}

/**
 * Check WebP support
 * @returns {boolean} WebP support
 */
function checkWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check AVIF support
 * @returns {boolean} AVIF support
 */
function checkAVIFSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
}

/**
 * Get network information if available
 * @returns {Object|null} Network information
 */
export function getNetworkInfo() {
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
    }
    return null;
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} Prefers reduced motion
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers dark mode
 * @returns {boolean} Prefers dark mode
 */
export function prefersDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check if user prefers high contrast
 * @returns {boolean} Prefers high contrast
 */
export function prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Reset cached device info (call on resize)
 */
export function resetCache() {
    cachedDeviceInfo = null;
}

/**
 * Initialize device detection with event listeners
 */
export function initDeviceDetection() {
    // Reset cache on viewport changes
    window.addEventListener('resize', resetCache);
    window.addEventListener('orientationchange', () => {
        setTimeout(resetCache, 100);
    });

    // Listen for network changes
    window.addEventListener('online', resetCache);
    window.addEventListener('offline', resetCache);

    // Listen for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', resetCache);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', resetCache);
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', resetCache);
}