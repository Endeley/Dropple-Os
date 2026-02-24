const handlers = new Map();

/**
 * Register a system event handler.
 * Intended to be called by higher layers (engine).
 */
export function registerSystemEventHandler(type, fn) {
    if (!type) throw new Error('registerSystemEventHandler: missing type');
    if (typeof fn !== 'function') {
        throw new Error('registerSystemEventHandler: handler must be function');
    }

    handlers.set(type, fn);
}

/**
 * Used by runtime dispatcher.
 */
export function getSystemEventHandler(type) {
    return handlers.get(type) ?? null;
}
