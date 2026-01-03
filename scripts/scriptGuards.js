export const SCRIPT_LIMITS = Object.freeze({
    MAX_EVENTS: 50,
});

/**
 * Runs a script with hard caps: emit-only, no listeners, no async, quota enforced.
 */
export function runScriptWithGuards(script, context) {
    let count = 0;
    const events = [];

    const api = {
        emit(evt) {
            count += 1;
            if (count > SCRIPT_LIMITS.MAX_EVENTS) {
                throw new Error('Script event quota exceeded');
            }
            events.push(evt);
        },
    };

    script.run({ ...context, api });

    return events;
}
