import {
    buildRuntimeSnapshotFromArtifact,
    exportFromRuntimeSnapshot,
    EXPORT_CANONICAL_VERSION,
    EXPORT_HASH_ALGORITHM,
} from '../exportArtifact.js';
import { getExportCapabilities } from '../getExportCapabilities.js';
import { createExportFingerprint } from '../exportFingerprint.js';
import { hashSimulationTrace } from '@/runtime/simulation/simulationTrace.js';
import {
    normalizeFederationAuditAttestation,
    resolveFederationAuditAttestation,
} from '../federationAuditAttestation.js';

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
    simulationTraceFingerprint = null,
    federationAuditAttestation = null,
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
    const reconstructedSimulationTraceFingerprint = hashSimulationTrace(
        snapshot?.runtime?.simulation?.trace ?? null
    );
    const traceFingerprintProvided =
        typeof simulationTraceFingerprint === 'string' && simulationTraceFingerprint.length > 0;
    const traceFingerprintRequired = options?.requireSimulationTraceFingerprint === true;
    const traceFingerprintMatches =
        traceFingerprintProvided &&
        simulationTraceFingerprint === reconstructedSimulationTraceFingerprint;
    const traceRequirementSatisfied = traceFingerprintRequired ? traceFingerprintProvided : true;
    const primitiveTraceLineageRequired = options?.requireSimulationPrimitiveTraceLineage === true;
    const traceEntries = Array.isArray(snapshot?.runtime?.simulation?.trace?.entries)
        ? snapshot.runtime.simulation.trace.entries
        : [];
    const primitiveTraceLineageProvided =
        (traceEntries.length === 0 ||
            traceEntries.every(
            (entry) => Array.isArray(entry?.primitiveTrace) && entry.primitiveTrace.length > 0,
        ));
    const primitiveTraceLineageSatisfied = primitiveTraceLineageRequired
        ? primitiveTraceLineageProvided
        : true;
    const reconstructedFederationAuditAttestation = resolveFederationAuditAttestation(snapshot);
    const normalizedProvidedFederationAuditAttestation =
        normalizeFederationAuditAttestation(federationAuditAttestation);
    const federationAuditAttestationRequired = options?.requireFederationAuditAttestation === true;
    const federationAuditAttestationProvided = Boolean(normalizedProvidedFederationAuditAttestation);
    const federationAuditAttestationMatches =
        federationAuditAttestationProvided &&
        Boolean(reconstructedFederationAuditAttestation) &&
        normalizedProvidedFederationAuditAttestation.hash === reconstructedFederationAuditAttestation.hash &&
        normalizedProvidedFederationAuditAttestation.entryCount === reconstructedFederationAuditAttestation.entryCount;
    const federationAuditAttestationRequirementSatisfied = federationAuditAttestationRequired
        ? federationAuditAttestationProvided
        : true;
    const reproductionMatches =
        reproducedFingerprint.exportHash === exportHash &&
        reproducedFingerprint.exportHash === providedFingerprint.exportHash;

    return Object.freeze({
        valid:
            capabilityMatches &&
            hashMatches &&
            reproductionMatches &&
            traceRequirementSatisfied &&
            primitiveTraceLineageSatisfied &&
            federationAuditAttestationRequirementSatisfied &&
            (!federationAuditAttestationProvided || federationAuditAttestationMatches) &&
            (!traceFingerprintProvided || traceFingerprintMatches),
        hashMatches,
        capabilityMatches,
        reproductionMatches,
        traceFingerprintMatches,
        traceFingerprintRequired,
        traceFingerprintProvided,
        primitiveTraceLineageRequired,
        primitiveTraceLineageProvided,
        federationAuditAttestationRequired,
        federationAuditAttestationProvided,
        federationAuditAttestationMatches,
        reconstructedFederationAuditAttestation,
        reconstructedSimulationTraceFingerprint,
        exportHash,
        algorithm,
        canonicalVersion,
    });
}
