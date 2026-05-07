export const RENDER_EXECUTION_STORE_VERSION = 'render-execution-registry@1';

function normalizeProgress(progress) {
    if (!progress || typeof progress !== 'object') return null;

    return {
        completedFrameCount: Number(progress.completedFrameCount ?? 0),
        totalFrames: Number(progress.totalFrames ?? 0),
        sampleCursor: Number(progress.sampleCursor ?? 0),
        totalSamples: Number(progress.totalSamples ?? 0),
        status: progress.status ?? 'idle',
    };
}

function normalizeHistoryEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;

    return {
        eventId: typeof entry.eventId === 'string' ? entry.eventId : null,
        revision: Number(entry.revision ?? 0),
        manifestId: typeof entry.manifestId === 'string' ? entry.manifestId : null,
        assignmentId: typeof entry.assignmentId === 'string' ? entry.assignmentId : null,
        checkpointId: typeof entry.checkpointId === 'string' ? entry.checkpointId : null,
        status: entry.status ?? 'unknown',
        progress: normalizeProgress(entry.progress),
    };
}

function normalizeRecord(record) {
    if (!record || typeof record !== 'object') return null;

    return {
        recordId: typeof record.recordId === 'string' ? record.recordId : null,
        manifestId: typeof record.manifestId === 'string' ? record.manifestId : null,
        sessionId: typeof record.sessionId === 'string' ? record.sessionId : null,
        assignmentId: typeof record.assignmentId === 'string' ? record.assignmentId : null,
        executorId: typeof record.executorId === 'string' ? record.executorId : null,
        workerId: typeof record.workerId === 'string' ? record.workerId : null,
        checkpointId: typeof record.checkpointId === 'string' ? record.checkpointId : null,
        status: record.status ?? 'unknown',
        progress: normalizeProgress(record.progress),
        attempt: Number(record.attempt ?? 0),
        terminal: record.terminal === true,
        history: Array.isArray(record.history)
            ? record.history.map(normalizeHistoryEntry).filter(Boolean)
            : [],
    };
}

function freezeRegistryState(state) {
    return Object.freeze({
        revision: Number(state.revision ?? 0),
        records: Object.freeze(
            (Array.isArray(state.records) ? state.records : []).map((record) =>
                Object.freeze({
                    ...record,
                    history: Object.freeze(record.history.map((entry) => Object.freeze(entry))),
                }),
            ),
        ),
    });
}

export function createRenderExecutionSnapshot({
    registryState,
    metadata = {},
} = {}) {
    if (!registryState || typeof registryState !== 'object') {
        throw new Error('createRenderExecutionSnapshot requires registryState.');
    }

    return {
        version: RENDER_EXECUTION_STORE_VERSION,
        savedAt: Date.now(),
        revision: Number(registryState.revision ?? 0),
        records: Array.isArray(registryState.records)
            ? registryState.records.map((record) => normalizeRecord(record)).filter(Boolean)
            : [],
        metadata: metadata && typeof metadata === 'object' ? { ...metadata } : {},
    };
}

export function hydrateRenderExecutionSnapshot(snapshot) {
    if (!snapshot || snapshot.version !== RENDER_EXECUTION_STORE_VERSION) return null;

    return freezeRegistryState({
        revision: Number(snapshot.revision ?? 0),
        records: Array.isArray(snapshot.records)
            ? snapshot.records.map((record) => normalizeRecord(record)).filter(Boolean)
            : [],
    });
}
