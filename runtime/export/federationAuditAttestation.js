import { createFederationAuditHash } from '@/core/collaboration/federationAuditState.js';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeEntryCount(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.floor(Number(value)));
}

export function resolveFederationAuditAttestation(snapshot) {
    const audit = snapshot?.runtime?.federationAudit;
    if (!isPlainObject(audit)) return null;

    const entries = Array.isArray(audit.entries) ? audit.entries : [];
    const hash = typeof audit.hash === 'string' && audit.hash.trim()
        ? audit.hash.trim()
        : createFederationAuditHash(entries);
    const entryCount = normalizeEntryCount(entries.length);

    if (!hash) return null;

    return Object.freeze({
        hash,
        entryCount,
    });
}

export function normalizeFederationAuditAttestation(attestation) {
    if (!isPlainObject(attestation)) return null;
    if (typeof attestation.hash !== 'string' || !attestation.hash.trim()) return null;

    return Object.freeze({
        hash: attestation.hash.trim(),
        entryCount: normalizeEntryCount(attestation.entryCount),
    });
}

