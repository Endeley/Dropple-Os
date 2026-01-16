export const LOCAL_DOCUMENT_VERSION = 1;

export function createLocalDocumentSnapshot({ events = [], cursorIndex = -1, metadata = {} } = {}) {
    return {
        version: LOCAL_DOCUMENT_VERSION,
        savedAt: Date.now(),
        events,
        cursorIndex,
        metadata,
    };
}

export function hydrateLocalDocumentSnapshot(snapshot) {
    if (!snapshot || snapshot.version !== LOCAL_DOCUMENT_VERSION) return null;

    return {
        events: Array.isArray(snapshot.events) ? snapshot.events : [],
        cursorIndex: Number.isFinite(snapshot.cursorIndex) ? snapshot.cursorIndex : -1,
        metadata: snapshot.metadata || {},
    };
}
