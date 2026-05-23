'use client';

const listeners = new Set();
const PUBLISH_TRUST_HISTORY_LIMIT = 5;
const PUBLISH_TRUST_HISTORY_STORAGE_KEY = 'dropple.templatePublishTrustHistory';

function normalizeHistoryEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;
    const status = typeof entry.status === 'string' ? entry.status : 'UNKNOWN';
    const summary = typeof entry.summary === 'string' ? entry.summary : '';
    const timestampMs = Number.isFinite(entry.timestampMs) ? Number(entry.timestampMs) : Date.now();
    return Object.freeze({
        status,
        summary,
        timestampMs,
    });
}

function loadPublishTrustHistory() {
    if (typeof window === 'undefined' || !window.localStorage) return Object.freeze([]);
    try {
        const raw = window.localStorage.getItem(PUBLISH_TRUST_HISTORY_STORAGE_KEY);
        if (!raw) return Object.freeze([]);
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return Object.freeze([]);
        const normalized = parsed
            .map((entry) => normalizeHistoryEntry(entry))
            .filter(Boolean)
            .slice(0, PUBLISH_TRUST_HISTORY_LIMIT);
        return Object.freeze(normalized);
    } catch {
        return Object.freeze([]);
    }
}

function persistPublishTrustHistory(history) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        window.localStorage.setItem(PUBLISH_TRUST_HISTORY_STORAGE_KEY, JSON.stringify(history ?? []));
    } catch {
        // Non-blocking persistence surface.
    }
}

const initialHistory = loadPublishTrustHistory();

let state = Object.freeze({
    open: false,
    mode: null,
    publishTrust: null,
    publishTrustHistory: initialHistory,
});

function emit() {
    listeners.forEach((listener) => {
        try {
            listener(state);
        } catch {
            // Keep facade subscribers isolated.
        }
    });
}

export function openTemplatePublishDialog({ mode = null } = {}) {
    state = Object.freeze({
        open: true,
        mode: mode ?? null,
        publishTrust: state.publishTrust ?? null,
        publishTrustHistory: state.publishTrustHistory ?? Object.freeze([]),
    });
    emit();
}

export function closeTemplatePublishDialog() {
    state = Object.freeze({
        open: false,
        mode: null,
        publishTrust: state.publishTrust ?? null,
        publishTrustHistory: state.publishTrustHistory ?? Object.freeze([]),
    });
    emit();
}

export function setTemplatePublishTrust(publishTrust) {
    const nextPublishTrust = normalizeHistoryEntry(publishTrust) ?? null;
    const nextHistory = nextPublishTrust
        ? [nextPublishTrust, ...(state.publishTrustHistory ?? [])].slice(0, PUBLISH_TRUST_HISTORY_LIMIT)
        : state.publishTrustHistory ?? [];
    state = Object.freeze({
        ...state,
        publishTrust: nextPublishTrust,
        publishTrustHistory: Object.freeze(nextHistory),
    });
    persistPublishTrustHistory(nextHistory);
    emit();
}

export function clearTemplatePublishTrust() {
    state = Object.freeze({
        ...state,
        publishTrust: null,
        publishTrustHistory: state.publishTrustHistory ?? Object.freeze([]),
    });
    emit();
}

export function getTemplatePublishDialogState() {
    return state;
}

export function subscribeTemplatePublishDialog(listener) {
    if (typeof listener !== 'function') {
        return () => {};
    }

    listeners.add(listener);
    listener(state);

    return () => {
        listeners.delete(listener);
    };
}
