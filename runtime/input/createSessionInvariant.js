function stableDetails(details) {
    if (!details || typeof details !== 'object') return {};
    const out = {};
    const keys = Object.keys(details).sort();
    for (const key of keys) {
        const value = details[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            out[key] = stableDetails(value);
            continue;
        }
        out[key] = value;
    }
    return out;
}

export function createSessionInvariantError(scope, reason, details = {}) {
    const payload = {
        scope,
        reason,
        details: stableDetails(details),
    };
    return new Error(JSON.stringify(payload));
}

export function assertCreateSessionInvariant(condition, scope, reason, details = {}) {
    if (condition) return;
    throw createSessionInvariantError(scope, reason, details);
}

