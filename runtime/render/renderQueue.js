function stableStringify(value) {
    if (value === undefined || value === null) return 'null';

    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }

    if (typeof value === 'object') {
        return `{${Object.keys(value)
            .sort()
            .map((key) => `"${key}":${stableStringify(value[key])}`)
            .join(',')}}`;
    }

    return JSON.stringify(value);
}

function hashString64(input) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;

    for (let index = 0; index < input.length; index += 1) {
        hash ^= BigInt(input.charCodeAt(index));
        hash = (hash * prime) & 0xffffffffffffffffn;
    }

    return hash.toString(16).padStart(16, '0');
}

function assertQueueState(queueState) {
    if (!queueState || typeof queueState !== 'object') {
        throw new Error('render queue operation requires queueState.');
    }
    if (!Array.isArray(queueState.entries)) {
        throw new Error('render queue operation requires queueState.entries.');
    }
}

function assertManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
        throw new Error('render queue operation requires manifest.');
    }
    if (typeof manifest.manifestId !== 'string' || !manifest.manifestId.trim()) {
        throw new Error('render queue operation requires manifest.manifestId.');
    }
    if (typeof manifest.sessionId !== 'string' || !manifest.sessionId.trim()) {
        throw new Error('render queue operation requires manifest.sessionId.');
    }
}

function createEntryId(manifestId, priority) {
    return `render-queue-entry:${hashString64(stableStringify({ manifestId, priority }))}`;
}

function buildQueueSnapshot({ revision = 0, entries = [] } = {}) {
    return Object.freeze({
        revision,
        entries: Object.freeze(entries.map((entry) => Object.freeze(entry))),
    });
}

function nextRevision(queueState) {
    return Number(queueState.revision ?? 0) + 1;
}

function normalizePriority(priority = 0) {
    const numericPriority = Number(priority);
    return Number.isFinite(numericPriority) ? numericPriority : 0;
}

function normalizeError(error) {
    if (!error) return null;
    if (typeof error === 'string') return { message: error };

    return {
        name: typeof error.name === 'string' ? error.name : 'Error',
        message: typeof error.message === 'string' ? error.message : String(error),
    };
}

function updateEntry(entries, manifestId, updater) {
    const index = entries.findIndex((entry) => entry.manifestId === manifestId);
    if (index < 0) {
        throw new Error(`render queue entry not found for manifest ${manifestId}.`);
    }

    const updated = updater(entries[index]);
    const nextEntries = [...entries];
    nextEntries[index] = updated;
    return nextEntries;
}

function findHighestPriorityQueuedEntry(entries) {
    return entries
        .filter((entry) => entry.status === 'queued')
        .sort((left, right) => {
            if (right.priority !== left.priority) return right.priority - left.priority;
            if (left.enqueuedRevision !== right.enqueuedRevision) {
                return left.enqueuedRevision - right.enqueuedRevision;
            }
            return String(left.manifestId).localeCompare(String(right.manifestId));
        })[0] ?? null;
}

export function createRenderQueueState() {
    return buildQueueSnapshot({
        revision: 0,
        entries: [],
    });
}

export function enqueueRenderManifest(queueState, manifest, options = {}) {
    assertQueueState(queueState);
    assertManifest(manifest);

    const existing = queueState.entries.find((entry) => entry.manifestId === manifest.manifestId) ?? null;
    if (existing && !['completed', 'failed', 'cancelled'].includes(existing.status)) {
        return queueState;
    }

    const priority = normalizePriority(options.priority);
    const revision = nextRevision(queueState);
    const nextEntry = {
        entryId: createEntryId(manifest.manifestId, priority),
        manifestId: manifest.manifestId,
        sessionId: manifest.sessionId,
        status: 'queued',
        priority,
        attempt: existing ? Number(existing.attempt ?? 0) : 0,
        executionId: null,
        progress: null,
        error: null,
        enqueuedRevision: revision,
        dequeuedRevision: null,
        startedRevision: null,
        completedRevision: null,
        failedRevision: null,
        cancelledRevision: null,
    };

    const entries = existing
        ? queueState.entries.map((entry) => (entry.manifestId === manifest.manifestId ? nextEntry : entry))
        : [...queueState.entries, nextEntry];

    return buildQueueSnapshot({
        revision,
        entries,
    });
}

export function dequeueRenderManifest(queueState) {
    assertQueueState(queueState);
    const entry = findHighestPriorityQueuedEntry(queueState.entries);
    if (!entry) {
        return {
            queueState,
            entry: null,
        };
    }

    const revision = nextRevision(queueState);
    const entries = updateEntry(queueState.entries, entry.manifestId, (current) => ({
        ...current,
        status: 'dequeued',
        dequeuedRevision: revision,
    }));

    return {
        queueState: buildQueueSnapshot({
            revision,
            entries,
        }),
        entry: Object.freeze({
            ...entry,
            status: 'dequeued',
            dequeuedRevision: revision,
        }),
    };
}

export function cancelRenderManifest(queueState, manifestId, reason = 'cancelled') {
    assertQueueState(queueState);
    const revision = nextRevision(queueState);
    const entries = updateEntry(queueState.entries, manifestId, (current) => ({
        ...current,
        status: 'cancelled',
        error: normalizeError(reason),
        executionId: null,
        cancelledRevision: revision,
    }));

    return buildQueueSnapshot({
        revision,
        entries,
    });
}

export function markRenderManifestRunning(queueState, manifestId, executionId, progress = null) {
    assertQueueState(queueState);
    const revision = nextRevision(queueState);
    const entries = updateEntry(queueState.entries, manifestId, (current) => {
        if (!['queued', 'dequeued', 'running'].includes(current.status)) {
            throw new Error(`render queue entry ${manifestId} cannot start from status ${current.status}.`);
        }

        return {
            ...current,
            status: 'running',
            attempt: Number(current.attempt ?? 0) + (current.status === 'running' ? 0 : 1),
            executionId: executionId ?? current.executionId ?? null,
            progress,
            error: null,
            startedRevision: current.startedRevision ?? revision,
        };
    });

    return buildQueueSnapshot({
        revision,
        entries,
    });
}

export function markRenderManifestCompleted(queueState, manifestId, progress = null) {
    assertQueueState(queueState);
    const revision = nextRevision(queueState);
    const entries = updateEntry(queueState.entries, manifestId, (current) => ({
        ...current,
        status: 'completed',
        progress,
        error: null,
        completedRevision: revision,
    }));

    return buildQueueSnapshot({
        revision,
        entries,
    });
}

export function markRenderManifestFailed(queueState, manifestId, error, progress = null) {
    assertQueueState(queueState);
    const revision = nextRevision(queueState);
    const entries = updateEntry(queueState.entries, manifestId, (current) => ({
        ...current,
        status: 'failed',
        progress,
        error: normalizeError(error),
        failedRevision: revision,
    }));

    return buildQueueSnapshot({
        revision,
        entries,
    });
}
