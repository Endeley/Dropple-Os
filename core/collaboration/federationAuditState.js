import { hashRuntimeState } from '@/core/persistence/hashDocument.js';

const DEFAULT_MAX_ENTRIES = 256;

function normalizeString(value, fallback = '') {
    const normalized = typeof value === 'string' ? value.trim() : '';
    return normalized || fallback;
}

function normalizeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? Number(value) : fallback;
}

function normalizePayload(payload = {}) {
    return Object.freeze({
        eventType: normalizeString(payload?.eventType, 'unknown'),
        sessionId: normalizeString(payload?.sessionId, 'unknown'),
        outcome: normalizeString(payload?.outcome, 'accepted'),
        reason: normalizeString(payload?.reason, 'none'),
        beforeSignature: normalizeString(payload?.beforeSignature, ''),
        afterSignature: normalizeString(payload?.afterSignature, ''),
        phaseBefore: normalizeString(payload?.phaseBefore, ''),
        phaseAfter: normalizeString(payload?.phaseAfter, ''),
        epochBefore: normalizeNumber(payload?.epochBefore, 0),
        epochAfter: normalizeNumber(payload?.epochAfter, 0),
    });
}

export function createInitialFederationAuditState() {
    return Object.freeze({
        entries: Object.freeze([]),
        hash: hashRuntimeState([]),
        maxEntries: DEFAULT_MAX_ENTRIES,
    });
}

export function createFederationAuditHash(entries = []) {
    const normalizedEntries = (Array.isArray(entries) ? entries : []).map((entry) => normalizePayload(entry?.payload ?? {}));
    return hashRuntimeState(normalizedEntries);
}

export function appendFederationAuditEntry(state, entry, maxEntries = DEFAULT_MAX_ENTRIES) {
    const current = state && typeof state === 'object' ? state : createInitialFederationAuditState();
    const cappedMaxEntries = Math.max(1, Math.floor(normalizeNumber(maxEntries, DEFAULT_MAX_ENTRIES)));
    const nextEntry = Object.freeze({
        type: 'runtime.federation.audit',
        payload: normalizePayload(entry?.payload ?? {}),
    });
    const nextEntries = [...(current.entries ?? []), nextEntry];
    const boundedEntries = nextEntries.slice(-cappedMaxEntries);
    const nextHash = createFederationAuditHash(boundedEntries);
    return Object.freeze({
        entries: Object.freeze(boundedEntries),
        hash: nextHash,
        maxEntries: cappedMaxEntries,
    });
}

