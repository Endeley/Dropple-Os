const listeners = new Set();

export function subscribeUXWarnings(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function emitUXWarningEvent(event) {
    for (const listener of listeners) {
        try {
            listener(event);
        } catch (err) {
            console.warn('[UX MODE] Warning listener failed', err);
        }
    }
}
