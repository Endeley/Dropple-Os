'use client';

const listeners = new Set();
const PUBLISH_TRUST_HISTORY_LIMIT = 5;

let state = Object.freeze({
    open: false,
    mode: null,
    publishTrust: null,
    publishTrustHistory: Object.freeze([]),
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
    const nextPublishTrust = publishTrust ?? null;
    const nextHistory = nextPublishTrust
        ? [nextPublishTrust, ...(state.publishTrustHistory ?? [])].slice(0, PUBLISH_TRUST_HISTORY_LIMIT)
        : state.publishTrustHistory ?? [];
    state = Object.freeze({
        ...state,
        publishTrust: nextPublishTrust,
        publishTrustHistory: Object.freeze(nextHistory),
    });
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
