import { ArtifactKind } from '@/core/artifacts/ArtifactKind.js';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isExportVerificationCriticalFlow({ artifact, format } = {}) {
    return (
        artifact?.kind === ArtifactKind.ENVIRONMENT ||
        format === 'dropple-spec'
    );
}

export function resolveExportVerificationPolicy({
    artifact,
    format,
    options = {},
} = {}) {
    const verification = isPlainObject(options?.verification) ? options.verification : {};
    const critical = isExportVerificationCriticalFlow({ artifact, format });

    const enabled =
        typeof verification.enabled === 'boolean'
            ? verification.enabled
            : critical;

    return Object.freeze({
        enabled,
        critical,
        verificationOptions: Object.freeze({
            requireSimulationTraceFingerprint:
                verification.requireSimulationTraceFingerprint !== false,
            requireSimulationPrimitiveTraceLineage:
                verification.requireSimulationPrimitiveTraceLineage !== false,
        }),
    });
}
