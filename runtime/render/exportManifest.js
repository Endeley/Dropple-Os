import { normalizeExportTarget } from '@/core/export/exportTargetContract.js';
import {
    EXPORT_CANONICAL_VERSION,
    EXPORT_HASH_ALGORITHM,
} from '@/runtime/export/exportFingerprint.js';

function stableStringify(value) {
    if (value === undefined || value === null) return 'null';

    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }

    if (typeof value === 'object') {
        return `{${Object.keys(value)
            .sort()
            .map((key) => `"${key}":${stableStringify(value[key])}`)
            .join(',')}}`;
    }

    return JSON.stringify(value);
}

function hashString64(input) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;

    for (let index = 0; index < input.length; index += 1) {
        hash ^= BigInt(input.charCodeAt(index));
        hash = (hash * prime) & 0xffffffffffffffffn;
    }

    return hash.toString(16).padStart(16, '0');
}

function normalizeVerificationMetadata(verification = {}) {
    return Object.freeze({
        algorithm:
            typeof verification?.algorithm === 'string' && verification.algorithm.trim()
                ? verification.algorithm.trim()
                : EXPORT_HASH_ALGORITHM,
        canonicalVersion:
            typeof verification?.canonicalVersion === 'string' && verification.canonicalVersion.trim()
                ? verification.canonicalVersion.trim()
                : EXPORT_CANONICAL_VERSION,
        exportHash: typeof verification?.exportHash === 'string' && verification.exportHash.trim()
            ? verification.exportHash.trim()
            : null,
    });
}

function assertRenderSession(session) {
    if (!session || typeof session !== 'object') {
        throw new Error('buildExportManifest requires renderSession.');
    }
    if (!Array.isArray(session.frameTimes) || !Array.isArray(session.sampleTimes)) {
        throw new Error('buildExportManifest requires canonical renderSession frameTimes and sampleTimes.');
    }
    if (typeof session.sessionId !== 'string' || !session.sessionId.trim()) {
        throw new Error('buildExportManifest requires renderSession.sessionId.');
    }
}

export function buildExportManifest({
    renderSession,
    exportTarget,
    verification = {},
} = {}) {
    assertRenderSession(renderSession);
    const normalizedExportTarget = normalizeExportTarget(exportTarget);
    const normalizedVerification = normalizeVerificationMetadata(verification);

    const manifestPayload = {
        sessionId: renderSession.sessionId,
        exportTarget: normalizedExportTarget,
        frameRate: Number(renderSession.frameRate ?? 24),
        stepMs: Number(renderSession.stepMs ?? 0),
        fromMs: Number(renderSession.fromMs ?? 0),
        toMs: Number(renderSession.toMs ?? 0),
        durationMs: Number(renderSession.durationMs ?? 0),
        frameTimes: [...renderSession.frameTimes],
        totalFrames: Number(renderSession.totalFrames ?? renderSession.frameTimes.length),
        sampleTimes: [...renderSession.sampleTimes],
        totalSamples: Array.isArray(renderSession.sampleTimes) ? renderSession.sampleTimes.length : 0,
        framePolicy: renderSession.framePolicy ?? null,
        samplePolicy: renderSession.samplePolicy ?? null,
        verification: normalizedVerification,
    };

    return Object.freeze({
        manifestId: `export-manifest:${hashString64(stableStringify(manifestPayload))}`,
        ...manifestPayload,
    });
}
