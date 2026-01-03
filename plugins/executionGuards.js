export const DEFAULT_LIMITS = Object.freeze({
    MAX_EXECUTION_MS: 50,
    MAX_EVENTS: 100,
});

/**
    * Wraps a sandbox with execution time and event quotas.
    * Hard-kills on violation.
    */
export function withExecutionGuards({ sandbox, pluginId, limits = DEFAULT_LIMITS, onViolation }) {
    let eventCount = 0;
    let killed = false;

    const timeoutId = setTimeout(() => {
        killed = true;
        sandbox.terminate();
        onViolation?.(pluginId, 'Execution timeout');
    }, limits.MAX_EXECUTION_MS);

    function trackEvent() {
        if (killed) return false;

        eventCount += 1;
        if (eventCount > limits.MAX_EVENTS) {
            killed = true;
            sandbox.terminate();
            onViolation?.(pluginId, 'Event quota exceeded');
            return false;
        }
        return true;
    }

    function clear() {
        clearTimeout(timeoutId);
    }

    return {
        trackEvent,
        clear,
    };
}
