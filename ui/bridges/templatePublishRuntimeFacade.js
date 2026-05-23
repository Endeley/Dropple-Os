'use client';

const listeners = new Set();

let state = Object.freeze({
    open: false,
    mode: null,
    publishTrust: null,
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
    });
    emit();
}

export function closeTemplatePublishDialog() {
    state = Object.freeze({
        open: false,
        mode: null,
        publishTrust: state.publishTrust ?? null,
    });
    emit();
}

export function setTemplatePublishTrust(publishTrust) {
    state = Object.freeze({
        ...state,
        publishTrust: publishTrust ?? null,
    });
    emit();
}

export function clearTemplatePublishTrust() {
    state = Object.freeze({
        ...state,
        publishTrust: null,
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
