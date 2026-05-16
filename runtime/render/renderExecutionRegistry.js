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

function assertRegistryState(registryState) {
    if (!registryState || typeof registryState !== 'object') {
        throw new Error('render execution registry requires registryState.');
    }
    if (!Array.isArray(registryState.records)) {
        throw new Error('render execution registry requires registryState.records.');
    }
}

function assertWorkflow(workflow) {
    if (!workflow || typeof workflow !== 'object') {
        throw new Error('render execution registry requires workflow.');
    }
    if (!workflow.manifest || typeof workflow.manifest.manifestId !== 'string') {
        throw new Error('render execution registry requires workflow.manifest.manifestId.');
    }
}

function freezeRecord(record) {
    return Object.freeze({
        ...record,
        history: Object.freeze(record.history.map((entry) => Object.freeze(entry))),
    });
}

function buildRegistrySnapshot({ revision = 0, records = [] } = {}) {
    return Object.freeze({
        revision,
        records: Object.freeze(records.map(freezeRecord)),
    });
}

function normalizeProgress(progress) {
    if (!progress || typeof progress !== 'object') return null;

    return Object.freeze({
        completedFrameCount: Number(progress.completedFrameCount ?? 0),
        totalFrames: Number(progress.totalFrames ?? 0),
        sampleCursor: Number(progress.sampleCursor ?? 0),
        totalSamples: Number(progress.totalSamples ?? 0),
        status: progress.status ?? 'idle',
    });
}

function normalizeSchedulerAttestation(attestation) {
    const checkpoint = attestation?.checkpoint ?? null;
    if (!checkpoint || typeof checkpoint !== 'object') return null;

    return Object.freeze({
        scheduleSignature: String(checkpoint.scheduleSignature ?? ''),
        partitionCursor: Number(checkpoint.partitionCursor ?? 0),
        completedPartitionIds: Object.freeze(
            [...(checkpoint.completedPartitionIds ?? [])].map((partitionId) => String(partitionId)),
        ),
        remainingPartitionIds: Object.freeze(
            [...(checkpoint.remainingPartitionIds ?? [])].map((partitionId) => String(partitionId)),
        ),
    });
}

function buildHistoryEntry({ workflow, revision }) {
    const manifestId = workflow.manifest.manifestId;
    const assignmentId = workflow.assignment?.assignmentId ?? null;
    const checkpointId = workflow.checkpoint?.checkpointId ?? null;
    const status = workflow.queueEntry?.status ?? 'unknown';
    const progress = normalizeProgress(workflow.progress);
    const schedulerAttestation = normalizeSchedulerAttestation(workflow.schedulerAttestation ?? workflow.checkpoint?.scheduler);

    return Object.freeze({
        eventId: `render-history:${hashString64(
            stableStringify({
                manifestId,
                assignmentId,
                checkpointId,
                revision,
                status,
                progress,
            }),
        )}`,
        revision,
        manifestId,
        assignmentId,
        checkpointId,
        status,
        progress,
        schedulerAttestation,
    });
}

function buildRecordFromWorkflow({ workflow, revision, history = [] }) {
    const progress = normalizeProgress(workflow.progress);
    const schedulerAttestation = normalizeSchedulerAttestation(workflow.schedulerAttestation ?? workflow.checkpoint?.scheduler);
    const terminalStatuses = new Set(['completed', 'failed', 'cancelled']);
    const status = workflow.queueEntry?.status ?? 'unknown';

    return {
        recordId: `render-record:${hashString64(stableStringify({ manifestId: workflow.manifest.manifestId }))}`,
        manifestId: workflow.manifest.manifestId,
        sessionId: workflow.manifest.sessionId,
        assignmentId: workflow.assignment?.assignmentId ?? null,
        executorId: workflow.executor?.executorId ?? null,
        workerId: workflow.executor?.workerId ?? null,
        checkpointId: workflow.checkpoint?.checkpointId ?? null,
        schedulerAttestation,
        status,
        progress,
        attempt: Number(workflow.queueEntry?.attempt ?? 0),
        terminal: terminalStatuses.has(status),
        history,
    };
}

export function createRenderExecutionRegistryState() {
    return buildRegistrySnapshot({
        revision: 0,
        records: [],
    });
}

export function recordRenderExecutionWorkflow(registryState, workflow) {
    assertRegistryState(registryState);
    assertWorkflow(workflow);

    const revision = Number(registryState.revision ?? 0) + 1;
    const historyEntry = buildHistoryEntry({ workflow, revision });
    const existing = registryState.records.find((record) => record.manifestId === workflow.manifest.manifestId) ?? null;
    const nextRecord = buildRecordFromWorkflow({
        workflow,
        revision,
        history: [...(existing?.history ?? []), historyEntry],
    });
    const records = existing
        ? registryState.records.map((record) => (record.manifestId === nextRecord.manifestId ? nextRecord : record))
        : [...registryState.records, nextRecord];

    return buildRegistrySnapshot({
        revision,
        records,
    });
}

export function getRenderExecutionRecord(registryState, manifestId) {
    assertRegistryState(registryState);
    return registryState.records.find((record) => record.manifestId === manifestId) ?? null;
}
