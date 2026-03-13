import crypto from 'crypto';

const VOLATILE_KEYS = new Set([
    'timestamp',
    'createdAt',
    'updatedAt',
    '_perf',
    'metrics',
]);

function stableStringify(value) {
    if (value === undefined) return 'null';
    if (value === null) return 'null';

    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }

    if (value && typeof value === 'object') {
        const keys = Object.keys(value)
            .filter((key) => !VOLATILE_KEYS.has(key))
            .sort();

        return `{${keys
            .map((key) => `"${key}":${stableStringify(value[key])}`)
            .join(',')}}`;
    }

    return JSON.stringify(value);
}

export function hashRuntimeState(state) {
    const payload = stableStringify(state);
    return crypto.createHash('sha256').update(payload).digest('hex');
}

export function hashCanonicalDocument(document) {
    return hashRuntimeState(document ?? {});
}
