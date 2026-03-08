const STORAGE_PREFIX = 'dropple.world.v1';

function getStorageKey(workspaceId) {
    const safeId = workspaceId || 'default';
    return `${STORAGE_PREFIX}.${safeId}`;
}

export const WorldStore = {
    save(workspaceId, worldState) {
        if (typeof window === 'undefined') return;
        if (!worldState) return;

        try {
            const key = getStorageKey(workspaceId);
            window.localStorage.setItem(key, JSON.stringify(worldState));
        } catch (err) {
            console.warn('[WorldStore] save failed', err);
        }
    },

    load(workspaceId) {
        if (typeof window === 'undefined') return null;
        const key = getStorageKey(workspaceId);
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch (err) {
            console.warn('[WorldStore] load failed', err);
            return null;
        }
    },

    clear(workspaceId) {
        if (typeof window === 'undefined') return;
        const key = getStorageKey(workspaceId);
        window.localStorage.removeItem(key);
    },
};
