import crypto from 'node:crypto';

function stableStringify(value) {
    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }

    if (value && typeof value === 'object') {
        const keys = Object.keys(value).sort();
        const entries = keys.map((key) => `"${key}":${stableStringify(value[key])}`);
        return `{${entries.join(',')}}`;
    }

    return JSON.stringify(value);
}

export function hashIR(ir) {
    const canonical = stableStringify(ir);

    return crypto.createHash('sha256').update(canonical).digest('hex');
}
