const PerformanceUtils = {
    throttle(fn, limit = 100) {
        let inThrottle = false;
        let lastArgs = null;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                    if (lastArgs) {
                        fn.apply(this, lastArgs);
                        lastArgs = null;
                    }
                }, limit);
            } else {
                lastArgs = args;
            }
        };
    },

    debounce(fn, wait = 100) {
        let timeoutId = null;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), wait);
        };
    },

    requestAnimationFrameThrottle(fn) {
        let rafId = null;
        let lastArgs = null;
        return function(...args) {
            lastArgs = args;
            if (rafId === null) {
                rafId = requestAnimationFrame(() => {
                    fn.apply(this, lastArgs);
                    rafId = null;
                    lastArgs = null;
                });
            }
        };
    },

    createFragment() {
        return document.createDocumentFragment();
    },

    batchAppend(parent, children) {
        const fragment = this.createFragment();
        children.forEach(child => fragment.appendChild(child));
        parent.appendChild(fragment);
    },

    memoize(fn, resolver) {
        const cache = new Map();
        const memoized = function(...args) {
            const key = resolver ? resolver(...args) : JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
        memoized.cache = cache;
        return memoized;
    },

    weakMemoize(fn) {
        const cache = new WeakMap();
        return function(key, ...args) {
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.call(this, key, ...args);
            cache.set(key, result);
            return result;
        };
    },

    createObjectPool(factory, reset, initialSize = 10) {
        const pool = [];
        for (let i = 0; i < initialSize; i++) {
            pool.push(factory());
        }
        return {
            acquire() {
                return pool.length > 0 ? pool.pop() : factory();
            },
            release(obj) {
                reset(obj);
                if (pool.length < initialSize * 2) {
                    pool.push(obj);
                }
            },
            getPoolSize() {
                return pool.length;
            }
        };
    }
};

const tooltipPool = PerformanceUtils.createObjectPool(
    () => {
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.85);
            color: #fff;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 300px;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            word-wrap: break-word;
        `;
        return tooltip;
    },
    (tooltip) => {
        tooltip.textContent = '';
        tooltip.style.display = 'none';
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    },
    5
);

const tagElementPool = PerformanceUtils.createObjectPool(
    () => {
        const span = document.createElement('span');
        span.className = 'tag-item';
        return span;
    },
    (span) => {
        span.textContent = '';
        span.className = 'tag-item';
        span.removeAttribute('data-value');
        span.removeAttribute('data-display');
    },
    20
);

export { PerformanceUtils, tooltipPool, tagElementPool };
