// runtime/projection/runtimeBridgeBus.js

const listeners = new Set();

/**
 * Projection-only signal emitter.
 * Runtime emits. UI or observers subscribe.
 */
export function emitRuntimeBridgeEvent(event) {
    for (const listener of listeners) {
        try {
            listener(event);
        } catch (err) {
            // Projection listeners must not break runtime flow.
            console.error('[runtimeBridgeBus] listener error', err);
        }
    }
}

/**
 * Subscribe to runtime projection events.
 * Returns an unsubscribe function.
 */
export function subscribeRuntimeBridge(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
