import {
    createRenderExecutionSnapshot,
    hydrateRenderExecutionSnapshot,
} from './renderExecutionSchema.js';

const STORAGE_KEY = 'dropple.render.execution.registry';

export function saveRenderExecutionSnapshot(snapshot) {
    if (typeof window === 'undefined') return;
    if (!snapshot) return;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
        console.warn('[renderExecutionStore] save failed', error);
    }
}

export function loadRenderExecutionSnapshot() {
    if (typeof window === 'undefined') return null;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.warn('[renderExecutionStore] load failed', error);
        return null;
    }
}

export function clearRenderExecutionStore() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
}

export function persistRenderExecutionRegistry(registryState, metadata = {}) {
    const snapshot = createRenderExecutionSnapshot({
        registryState,
        metadata,
    });
    saveRenderExecutionSnapshot(snapshot);
    return snapshot;
}

export function restoreRenderExecutionRegistry() {
    const snapshot = loadRenderExecutionSnapshot();
    return hydrateRenderExecutionSnapshot(snapshot);
}
