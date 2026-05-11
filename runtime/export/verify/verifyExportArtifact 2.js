import {
    buildRuntimeSnapshotFromArtifact,
    exportFromRuntimeSnapshot,
    EXPORT_CANONICAL_VERSION,
    EXPORT_HASH_ALGORITHM,
} from '../exportArtifact.js';
import { getExportCapabilities } from '../getExportCapabilities.js';
import { createExportFingerprint } from '../exportFingerprint.js';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export async function verifyExportArtifact({
    artifact,
    format,
    output,
    exportHash,
    canonicalVersion = EXPORT_CANONICAL_VERSION,
    algorithm = EXPORT_HASH_ALGORITHM,
    options = {},
} = {}) {
    if (!isPlainObject(artifact)) {
        throw new Error('verifyExportArtifact requires artifact.');
    }

    if (typeof format !== 'string' || format.length === 0) {
        throw new Error('verifyExportArtifact requires format.');
    }

    if (typeof exportHash !== 'string' || exportHash.length === 0) {
        throw new Error('verifyExportArtifact requires exportHash.');
    }

    const capabilities = getExportCapabilities(artifact);
    const capabilityMatches = capabilities.formats.includes(format);
    const providedFingerprint = await createExportFingerprint({
        output,
        algorithm,
        canonicalVersion,
    });
    const hashMatches = providedFingerprint.exportHash === exportHash;

    const snapshot = buildRuntimeSnapshotFromArtifact(artifact);
    const reproducedOutput = await exportFromRuntimeSnapshot({
        snapshot,
        format,
        options: {
            ...options,
            download: false,
        },
    });
    const reproducedFingerprint = await createExportFingerprint({
        output: reproducedOutput,
        algorithm,
        canonicalVersion,
    });
    const reproductionMatches =
        reproducedFingerprint.exportHash === exportHash &&
        reproducedFingerprint.exportHash === providedFingerprint.exportHash;

    return Object.freeze({
        valid: capabilityMatches && hashMatches && reproductionMatches,
        hashMatches,
        capabilityMatches,
        reproductionMatches,
        exportHash,
        algorithm,
        canonicalVersion,
    });
}
