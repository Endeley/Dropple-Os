export function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function createOutcome({
    ok,
    severity = 'info',
    invariant,
    classification = 'lawful-evolution',
    message,
} = {}) {
    return Object.freeze({
        ok: ok === true,
        severity,
        invariant: String(invariant ?? ''),
        classification: String(classification ?? 'lawful-evolution'),
        message: String(message ?? ''),
    });
}

export function parseVersion(value) {
    if (typeof value !== 'string') return null;
    const match = value.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) return null;
    return match.slice(1).map((part) => Number(part));
}

export function compareVersions(left, right) {
    const a = parseVersion(left);
    const b = parseVersion(right);
    if (!a || !b) return 0;
    for (let index = 0; index < 3; index += 1) {
        if (a[index] > b[index]) return 1;
        if (a[index] < b[index]) return -1;
    }
    return 0;
}

