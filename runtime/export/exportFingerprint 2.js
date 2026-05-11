const EXPORT_HASH_ALGORITHM = 'sha-256';
const EXPORT_CANONICAL_VERSION = 'dropple-export@1';

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

function bytesToHex(bytes) {
    return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

function resolveSubtleCrypto() {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
        throw new Error('Export fingerprinting requires Web Crypto SubtleCrypto support.');
    }

    return subtle;
}

async function toHashBytes(output) {
    if (typeof output === 'string') {
        return new TextEncoder().encode(output);
    }

    if (typeof Blob !== 'undefined' && output instanceof Blob) {
        return new Uint8Array(await output.arrayBuffer());
    }

    if (output instanceof ArrayBuffer) {
        return new Uint8Array(output);
    }

    if (ArrayBuffer.isView(output)) {
        return new Uint8Array(output.buffer, output.byteOffset, output.byteLength);
    }

    return new TextEncoder().encode(stableStringify(output));
}

export async function hashExportOutput(output, algorithm = EXPORT_HASH_ALGORITHM) {
    if (algorithm !== EXPORT_HASH_ALGORITHM) {
        throw new Error(`Unsupported export hash algorithm: ${algorithm}`);
    }

    const subtle = resolveSubtleCrypto();
    const digest = await subtle.digest('SHA-256', await toHashBytes(output));
    return bytesToHex(new Uint8Array(digest));
}

export async function createExportFingerprint({
    output,
    algorithm = EXPORT_HASH_ALGORITHM,
    canonicalVersion = EXPORT_CANONICAL_VERSION,
} = {}) {
    return Object.freeze({
        exportHash: await hashExportOutput(output, algorithm),
        algorithm,
        canonicalVersion,
    });
}

export {
    EXPORT_CANONICAL_VERSION,
    EXPORT_HASH_ALGORITHM,
};
