'use client';

import { loadRenderExecutionCommands } from '@/ui/bridges/exportExecutionRuntimeBridge.js';

function createEmptyCommandState() {
    return Object.freeze({
        registryState: Object.freeze({
            revision: 0,
            records: Object.freeze([]),
        }),
        workflow: null,
    });
}

function findActiveRecord(workflow, registryState) {
    const manifestId = workflow?.manifest?.manifestId ?? null;
    const records = registryState?.records ?? [];

    if (manifestId) {
        return records.find((record) => record.manifestId === manifestId) ?? null;
    }

    return records.length ? records[records.length - 1] : null;
}

function buildHistorySummary(historyEntry) {
    return Object.freeze({
        eventId: historyEntry?.eventId ?? null,
        revision: historyEntry?.revision ?? 0,
        status: historyEntry?.status ?? 'unknown',
        checkpointId: historyEntry?.checkpointId ?? null,
        assignmentId: historyEntry?.assignmentId ?? null,
        progress: historyEntry?.progress ?? null,
    });
}

function buildRecordSummary(record) {
    if (!record) return null;

    return Object.freeze({
        recordId: record.recordId ?? null,
        manifestId: record.manifestId ?? null,
        sessionId: record.sessionId ?? null,
        assignmentId: record.assignmentId ?? null,
        checkpointId: record.checkpointId ?? null,
        status: record.status ?? 'unknown',
        terminal: record.terminal === true,
        progress: record.progress ?? null,
        historyCount: Array.isArray(record.history) ? record.history.length : 0,
        history: Object.freeze((record.history ?? []).map(buildHistorySummary)),
    });
}

function buildProvenance(workflow, activeRecord, registryState) {
    const progress = workflow?.progress ?? activeRecord?.progress ?? null;
    const history = activeRecord?.history ?? [];

    return Object.freeze({
        registryRevision: registryState?.revision ?? 0,
        manifestId: workflow?.manifest?.manifestId ?? activeRecord?.manifestId ?? null,
        sessionId: workflow?.manifest?.sessionId ?? activeRecord?.sessionId ?? null,
        assignmentId: workflow?.assignment?.assignmentId ?? activeRecord?.assignmentId ?? null,
        checkpointId: workflow?.checkpoint?.checkpointId ?? activeRecord?.checkpointId ?? null,
        executionId: workflow?.executionState?.executionId ?? workflow?.queueEntry?.executionId ?? null,
        recordId: activeRecord?.recordId ?? null,
        status: workflow?.queueEntry?.status ?? activeRecord?.status ?? null,
        terminal: activeRecord?.terminal === true,
        progress,
        historyCount: history.length,
        latestEventId: history.length ? history[history.length - 1].eventId : null,
    });
}

function buildServiceSnapshot(state) {
    const workflow = state?.workflow ?? null;
    const registryState = state?.registryState ?? createEmptyCommandState().registryState;
    const activeRecord = findActiveRecord(workflow, registryState);

    return Object.freeze({
        workflow,
        registryState,
        activeRecord: buildRecordSummary(activeRecord),
        provenance: buildProvenance(workflow, activeRecord, registryState),
        recentRecords: Object.freeze(
            [...(registryState.records ?? [])]
                .slice(-5)
                .reverse()
                .map(buildRecordSummary)
                .filter(Boolean),
        ),
    });
}

export function createExportExecutionService({
    initialState = createEmptyCommandState(),
} = {}) {
    let state = initialState;

    return Object.freeze({
        getState() {
            return buildServiceSnapshot(state);
        },

        async createWorkflow({ snapshot, exportTarget = null } = {}) {
            const { createExportExecutionCommand } = await loadRenderExecutionCommands();
            const result = createExportExecutionCommand({
                snapshot,
                exportTarget,
                state,
            });
            state = result.state;
            return result.result;
        },

        async stepWorkflow({ snapshot, exportTarget = null } = {}) {
            const { stepExportExecutionCommand } = await loadRenderExecutionCommands();
            const result = stepExportExecutionCommand({
                snapshot,
                exportTarget,
                state,
            });
            state = result.state;
            return result.result;
        },

        async runWorkflow({ snapshot, exportTarget = null } = {}) {
            const { runExportExecutionCommand } = await loadRenderExecutionCommands();
            const result = runExportExecutionCommand({
                snapshot,
                exportTarget,
                state,
            });
            state = result.state;
            return result.result;
        },

        async performWorkflow() {
            const { performExportExecutionCommand } = await loadRenderExecutionCommands();
            return performExportExecutionCommand({
                state,
            });
        },

        async persist(metadata = {}) {
            const { persistRenderExecutionCommandState } = await loadRenderExecutionCommands();
            return persistRenderExecutionCommandState({
                state,
                metadata,
            });
        },

        async restore() {
            const { restoreRenderExecutionCommandState } = await loadRenderExecutionCommands();
            state = restoreRenderExecutionCommandState();
            return buildServiceSnapshot(state);
        },

        reset() {
            state = createEmptyCommandState();
            return buildServiceSnapshot(state);
        },
    });
}
