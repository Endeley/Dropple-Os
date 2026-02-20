const listeners = new Set();

export function emitPerfEvent(event) {
    if (!event) return;
    for (const listener of listeners) {
        try {
            listener(event);
        } catch (err) {
            console.warn('[perfEvents] listener error', err);
        }
    }
}

export function subscribePerfEvents(listener) {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
}
